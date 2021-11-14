import { Button } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/layout';
import { Progress } from '@chakra-ui/progress';
import { Select } from '@chakra-ui/select';
import { Spinner } from '@chakra-ui/spinner';
import { Switch } from '@chakra-ui/switch';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MdCall,
  MdMic,
  MdMicOff,
  MdRefresh,
  MdVideocam,
  MdVideocamOff,
  MdVolumeOff,
  MdVolumeUp,
} from 'react-icons/md';
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
} from 'react-icons/ri';
import { useMutation } from 'react-query';
import { openvidu } from '../../../core/openvidu';
import { useOpenViduSession, useOpenViduToken } from '../../../core/query';
import { useCallSettings } from '../../../core/store';
import { getMediaDevices } from '../../../core/utils';

const CallSetup = props => {
  const { room, ...rest } = props;

  const optionBgColor = useColorModeValue('gray.100', 'whiteAlpha.50');

  const callSettings = useCallSettings();
  const callSession = useOpenViduSession(room._id, { enabled: false });
  const callToken = useOpenViduToken(room._id);
  const callMutation = useMutation(callToken.refetch);

  const [loadingDevices, setLoadingDevices] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);

  const [testMic, setTestMic] = useState(false);
  const [micVolume, setMicVolume] = useState(-Infinity);

  const publisher = useRef();
  const video = useRef();

  const toggleCam = e => callSettings.camEnabled.set(e.target.checked);
  const toggleMic = e => callSettings.micEnabled.set(e.target.checked);
  const toggleSound = e => callSettings.soundEnabled.set(e.target.checked);
  const toggleTestMic = () => setTestMic(!testMic);

  const handleMicrophoneChange = e =>
    callSettings.selectedMic.set(e.target.value);
  const handleCameraChange = e => callSettings.selectedCam.set(e.target.value);
  const handleReloadDevices = async () => await loadDevices();
  const handleStartCall = () => callMutation.mutate();

  const loadDevices = async () => {
    setLoadingDevices(true);

    const devices = await getMediaDevices();
    setMicrophones(devices.audioInputs);
    setCameras(devices.videoInputs);

    callSettings.batch(settings => {
      if (devices.videoInputs.length === 0) {
        settings.camEnabled.set(false);
        settings.selectedCam.set('');
      } else {
        const camFound = !!devices.videoInputs.find(
          i => i.deviceId === settings.selectedCam.value
        );
        if (!camFound) {
          settings.camEnabled.set(true);
          settings.selectedCam.set(devices.videoInputs[0].deviceId);
        }
      }

      if (devices.audioInputs.length === 0) {
        settings.micEnabled.set(false);
        settings.selectedMic.set('');
      } else {
        const micFound = !!devices.audioInputs.find(
          i => i.deviceId === settings.selectedMic.value
        );
        if (!micFound) {
          settings.micEnabled.set(true);
          settings.selectedMic.set(devices.audioInputs[0].deviceId);
        }
      }
    });

    setLoadingDevices(false);
  };

  const initPublisher = async () => {
    publisher.current = await openvidu.initPublisherAsync(undefined, {
      publishVideo: callSettings.camEnabled.value,
      publishAudio: callSettings.micEnabled.value,
      videoSource: callSettings.selectedCam.value || false,
      audioSource: callSettings.selectedMic.value || false,
      mirror: false,
    });

    try {
      publisher.current.addVideoElement(video.current);
    } catch (err) {
      console.error('Failed to add video element', err);
      destroyPublisher();
    }

    publisher.current.on('streamAudioVolumeChange', e =>
      setMicVolume(e.value.newValue)
    );
  };

  const destroyPublisher = () => {
    if (publisher.current) {
      publisher.current.off('streamAudioVolumeChange');
      publisher.current.stream
        .getMediaStream()
        .getTracks()
        .forEach(track => track.stop());
    }
  };

  const updateStream = async () => {
    if (!callSettings.selectedCam.value && !callSettings.selectedMic.value)
      return;

    if (!publisher.current) {
      await initPublisher();
    } else {
      await openvidu
        .getUserMedia({
          videoSource: callSettings.selectedCam.value || false,
          audioSource: callSettings.selectedMic.value || false,
        })
        .then(async stream => {
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          if (
            !publisher.current.stream.hasVideo ||
            !publisher.current.stream.hasAudio
          ) {
            // Have to create a new publisher to add/remove tracks
            destroyPublisher();
            await initPublisher();
          } else {
            if (videoTracks.length > 0 && publisher.current.stream.hasVideo)
              await publisher.current.replaceTrack(videoTracks[0]);
            if (audioTracks.length > 0 && publisher.current.stream.hasAudio)
              await publisher.current.replaceTrack(audioTracks[0]);

            publisher.current.off('streamAudioVolumeChange');
            publisher.current.on('streamAudioVolumeChange', e =>
              setMicVolume(e.value.newValue)
            );
            // Have to set it again manually because of a bug
            publisher.current.videoReference.muted = !testMic;
          }
        });
    }
  };

  useEffect(async () => {
    await loadDevices();
  }, []);

  useEffect(async () => {
    await updateStream();
  }, [callSettings.selectedCam.value, callSettings.selectedMic.value]);

  useEffect(() => {
    publisher.current?.publishVideo(callSettings.camEnabled.value);
  }, [callSettings.camEnabled.value]);

  useEffect(() => {
    publisher.current?.publishAudio(callSettings.micEnabled.value);
  }, [callSettings.micEnabled.value]);

  useEffect(() => {
    if (publisher.current) publisher.current.videoReference.muted = !testMic;
  }, [testMic]);

  useLayoutEffect(() => {
    // Stop media stream on unmount
    return () => {
      destroyPublisher();
    };
  }, []);

  return (
    <VStack {...rest} px={3} pb={6} spacing={4} alignItems="stretch">
      <Box
        bg="black"
        w="100%"
        pt="75%"
        borderRadius="lg"
        position="relative"
        overflow="hidden"
      >
        <video
          muted={!testMic}
          ref={video}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            backgroundSize: 'cover',
            overflow: 'hidden',
            objectFit: 'cover',
          }}
        />
        {loadingDevices && (
          <Center position="absolute" top={0} left={0} right={0} bottom={0}>
            <Spinner color="white" size="xl" top={0} />
          </Center>
        )}
      </Box>
      <HStack bg={optionBgColor} py={2.5} px={4} borderRadius="md">
        {callSettings.camEnabled.value ? (
          <MdVideocam size={24} />
        ) : (
          <MdVideocamOff size={24} />
        )}
        <Text flex="1">Camera</Text>
        <Switch
          isDisabled={cameras.length === 0}
          isChecked={callSettings.camEnabled.value}
          onChange={toggleCam}
          colorScheme="green"
        />
      </HStack>
      <HStack bg={optionBgColor} py={2} px={4} borderRadius="md">
        {callSettings.micEnabled.value ? (
          <MdMic size={24} />
        ) : (
          <MdMicOff size={24} />
        )}
        <Text flex="1">Microphone</Text>
        <Switch
          isDisabled={microphones.length === 0}
          isChecked={callSettings.micEnabled.value}
          onChange={toggleMic}
          colorScheme="green"
        />
      </HStack>
      <HStack bg={optionBgColor} py={2} px={4} borderRadius="md">
        {callSettings.soundEnabled.value ? (
          <MdVolumeUp size={24} />
        ) : (
          <MdVolumeOff size={24} />
        )}
        <Text flex="1">Sound</Text>
        <Switch
          isChecked={callSettings.soundEnabled.value}
          onChange={toggleSound}
          colorScheme="green"
        />
      </HStack>
      <Select
        value={callSettings.selectedCam.value}
        onChange={handleCameraChange}
        variant="filled"
      >
        <option value="" disabled={!loadingDevices}>
          {loadingDevices
            ? 'Loading devices...'
            : cameras.length > 0
            ? 'Select camera'
            : 'Camera not available'}
        </option>
        {cameras.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </Select>
      <VStack alignItems="stretch">
        <Select
          value={callSettings.selectedMic.value}
          onChange={handleMicrophoneChange}
          variant="filled"
        >
          <option value="" disabled={!loadingDevices}>
            {loadingDevices
              ? 'Loading devices...'
              : microphones.length > 0
              ? 'Select microphone'
              : 'Microphone not available'}
          </option>
          {microphones.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </Select>
        <Progress
          value={Math.max(0, micVolume + 100)}
          height={1.5}
          borderRadius="full"
          colorScheme="green"
        />
      </VStack>
      <Button onClick={toggleTestMic} borderRadius="full">
        <HStack>
          {testMic ? (
            <RiCheckboxCircleFill size={20} />
          ) : (
            <RiCheckboxBlankCircleLine size={20} />
          )}

          <Text>Test microphone</Text>
        </HStack>
      </Button>
      <Button onClick={handleReloadDevices} borderRadius="full">
        <HStack>
          <MdRefresh size={20} />
          <Text>Reload devices</Text>
        </HStack>
      </Button>
      <Box flex="1" />
      {!callToken.data?.token && (
        <Button
          onClick={handleStartCall}
          isLoading={callMutation.isLoading}
          alignSelf="center"
          size="lg"
          borderRadius="full"
          colorScheme="green"
        >
          <HStack>
            <MdCall size={20} />
            <Text>{callSession.data?.active ? 'Join call' : 'Start call'}</Text>
          </HStack>
        </Button>
      )}
    </VStack>
  );
};

export default CallSetup;

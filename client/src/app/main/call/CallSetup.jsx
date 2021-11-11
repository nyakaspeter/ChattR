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
  MdVideocam,
  MdVideocamOff,
  MdVolumeOff,
  MdVolumeUp,
} from 'react-icons/md';
import { openvidu } from '../../../core/openvidu';
import { getMediaDevices } from '../../../core/utils';

const CallSetup = props => {
  const optionBgColor = useColorModeValue('gray.100', 'whiteAlpha.50');

  const [loadingDevices, setLoadingDevices] = useState(true);
  const [microphones, setMicrophones] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
  });
  const [micVolume, setMicVolume] = useState(-Infinity);

  const [camEnabled, setCamEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const publisher = useRef();
  const video = useRef();

  const toggleCam = e => {
    setCamEnabled(e.target.checked);

    if (publisher.current) {
      publisher.current.publishVideo(e.target.checked);
    }
  };

  const toggleMic = e => {
    setMicEnabled(e.target.checked);

    if (publisher.current) {
      publisher.current.publishAudio(e.target.checked);
    }
  };

  const toggleSound = e => {
    setSoundEnabled(e.target.checked);

    if (publisher.current) {
      publisher.current.videoReference.muted = !e.target.checked;
    }
  };

  const handleMicrophoneChange = e => {
    setSelectedDevices({
      camera: selectedDevices.camera,
      microphone: e.target.value,
    });
  };

  const handleCameraChange = e => {
    setSelectedDevices({
      camera: e.target.value,
      microphone: selectedDevices.microphone,
    });
  };

  const updateStream = async () => {
    if (!selectedDevices.camera && !selectedDevices.microphone) return;

    if (!publisher.current) {
      publisher.current = await openvidu.initPublisherAsync(undefined, {
        publishVideo: camEnabled,
        publishAudio: micEnabled,
        videoSource: selectedDevices.camera || false,
        audioSource: selectedDevices.microphone || false,
      });
      publisher.current.addVideoElement(video.current);

      publisher.current.on('streamAudioVolumeChange', e =>
        setMicVolume(e.value.newValue)
      );
    } else {
      await openvidu
        .getUserMedia({
          videoSource: selectedDevices.camera || false,
          audioSource: selectedDevices.microphone || false,
        })
        .then(async stream => {
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          if (videoTracks.length > 0)
            await publisher.current.replaceTrack(videoTracks[0]);
          if (audioTracks.length > 0)
            await publisher.current.replaceTrack(audioTracks[0]);

          publisher.current.off('streamAudioVolumeChange');
          publisher.current.on('streamAudioVolumeChange', e =>
            setMicVolume(e.value.newValue)
          );
          publisher.current.videoReference.muted = !soundEnabled;
        });
    }
  };

  const stopStream = () => {
    if (publisher.current) {
      publisher.current.off('streamAudioVolumeChange');
      publisher.current.stream
        .getMediaStream()
        .getTracks()
        .forEach(track => track.stop());
    }
  };

  useEffect(async () => {
    const devices = await getMediaDevices();
    setMicrophones(devices.audioInputs);
    setCameras(devices.videoInputs);
    setSelectedDevices({
      camera: devices.videoInputs[0]?.deviceId || '',
      microphone: devices.audioInputs[0]?.deviceId || '',
    });
    setLoadingDevices(false);
  }, []);

  useEffect(async () => {
    await updateStream();
  }, [selectedDevices]);

  useLayoutEffect(() => {
    // Stop media stream on unmount
    return () => {
      stopStream();
    };
  }, []);

  return (
    <VStack px={3} spacing={4} alignItems="stretch">
      <Box
        bg="blackAlpha.800"
        w="100%"
        pt="75%"
        borderRadius="lg"
        position="relative"
        overflow="hidden"
      >
        <video
          muted={!soundEnabled}
          ref={video}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            display: 'block',
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
        {camEnabled ? <MdVideocam size={24} /> : <MdVideocamOff size={24} />}
        <Text flex="1">Camera</Text>
        <Switch
          defaultChecked={camEnabled}
          onChange={toggleCam}
          colorScheme="green"
        />
      </HStack>
      <HStack bg={optionBgColor} py={2} px={4} borderRadius="md">
        {micEnabled ? <MdMic size={24} /> : <MdMicOff size={24} />}
        <Text flex="1">Microphone</Text>
        <Switch
          defaultChecked={micEnabled}
          onChange={toggleMic}
          colorScheme="green"
        />
      </HStack>
      <HStack bg={optionBgColor} py={2} px={4} borderRadius="md">
        {soundEnabled ? <MdVolumeUp size={24} /> : <MdVolumeOff size={24} />}
        <Text flex="1">Sidetone</Text>
        <Switch
          defaultChecked={soundEnabled}
          onChange={toggleSound}
          colorScheme="green"
        />
      </HStack>
      <Select
        value={selectedDevices.camera}
        onChange={handleCameraChange}
        variant="filled"
      >
        <option value="" disabled>
          {cameras.length > 0 ? 'Select camera' : 'Camera not available'}
        </option>
        {cameras.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </Select>
      <VStack alignItems="stretch">
        <Select
          value={selectedDevices.microphone}
          onChange={handleMicrophoneChange}
          variant="filled"
        >
          <option value="" disabled>
            {microphones.length > 0
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
      <Button
        alignSelf="center"
        size="lg"
        borderRadius="full"
        colorScheme="green"
      >
        <HStack>
          <MdCall size={20} />
          <Text>Start call</Text>
        </HStack>
      </Button>
    </VStack>
  );
};

export default CallSetup;

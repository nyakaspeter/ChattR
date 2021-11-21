import { Button, IconButton } from '@chakra-ui/button';
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/layout';
import { SlideFade } from '@chakra-ui/transition';
import { useHookstate } from '@hookstate/core';
import React, { useEffect, useRef, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { BsRecordFill } from 'react-icons/bs';
import {
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdScreenShare,
  MdStopScreenShare,
  MdVideocam,
  MdVideocamOff,
  MdVolumeOff,
  MdVolumeUp,
} from 'react-icons/md';
import { useMutation, useQueryClient } from 'react-query';
import { Prompt } from 'react-router';
import ElapsedTimeText from '../../../components/ElapsedTime';
import { hangupCall, startRecording, stopRecording } from '../../../core/api';
import { openvidu } from '../../../core/openvidu';
import { roomKeys, useOpenViduSession, useUser } from '../../../core/query';
import { useCallSettings } from '../../../core/store';
import VideoGrid from './VideoGrid';

const CallScreen = props => {
  const { room, callToken, ...rest } = props;

  const user = useUser();
  const own = user.data._id === room.owner;

  const queryClient = useQueryClient();
  const callSettings = useCallSettings();
  const callSession = useOpenViduSession(room._id);
  const publisher = useRef();
  const session = useRef();

  const selectedDevices = useHookstate({
    cam: callSettings.selectedCam.value,
    mic: callSettings.selectedMic.value,
  });
  const [error, setError] = useState(false);
  const [local, setLocal] = useState();
  const [peers, setPeers] = useState([]);

  const getFilter = () =>
    callSettings.nameOverlay.value
      ? {
          type: 'GStreamerFilter',
          options: {
            command: `textoverlay text="${user.data.name}" valignment=top halignment=right font-desc="Cantarell 16"`,
          },
        }
      : undefined;

  const connectToSession = async () => {
    try {
      session.current = openvidu.initSession();

      session.current.on('streamCreated', async e => {
        const subscriber = await session.current.subscribeAsync(e.stream);
        setPeers([...peers, subscriber]);
      });

      session.current.on('streamDestroyed', e => {
        setPeers(
          peers.filter(subscriber => subscriber !== e.stream.streamManager)
        );
      });

      await session.current.connect(callToken.token);
    } catch (err) {
      console.error('Failed to connect to session', err);
      setError(true);
    }
  };

  const initPublisher = async () => {
    if (!session.current.connection) {
      return;
    }

    if (!selectedDevices.cam.value && !selectedDevices.mic.value) {
      return;
    }

    publisher.current = await openvidu.initPublisherAsync(undefined, {
      publishVideo:
        selectedDevices.cam.value === 'screen'
          ? true
          : callSettings.camEnabled.value,
      publishAudio: callSettings.micEnabled.value,
      videoSource: selectedDevices.cam.value || false,
      audioSource: selectedDevices.mic.value || false,
      mirror: false,
      filter: getFilter(),
    });
    setLocal(publisher.current);

    if (selectedDevices.cam.value === 'screen') {
      subscribeToScreenShareEnd();
    }

    await session.current.publish(publisher.current);
  };

  const updatePublisher = async () => {
    const currentTracks =
      publisher.current.stream.mediaStream.getTracks().length;
    let newTracks = 0;
    if (selectedDevices.cam.value) newTracks++;
    if (selectedDevices.mic.value) newTracks++;

    if (currentTracks !== newTracks) {
      await stopStream();
      await initPublisher();
      return;
    }

    await openvidu
      .getUserMedia({
        videoSource: selectedDevices.cam.value || false,
        audioSource: selectedDevices.mic.value || false,
      })
      .then(
        async stream => {
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          if (videoTracks.length > 0 && publisher.current.stream.hasVideo)
            await publisher.current.replaceTrack(videoTracks[0]);
          if (audioTracks.length > 0 && publisher.current.stream.hasAudio)
            await publisher.current.replaceTrack(audioTracks[0]);

          // TODO: Resubscribe to speaking events on the local video

          // Have to set it again manually because of a bug
          publisher.current.videoReference.muted = true;

          publisher.current.publishVideo(
            selectedDevices.cam.value === 'screen'
              ? true
              : callSettings.camEnabled.value
          );

          if (selectedDevices.cam.value === 'screen') {
            subscribeToScreenShareEnd();
          }
        },
        async error => {
          if (selectedDevices.cam.value === 'screen') {
            console.error('Failed to share screen', error);
            selectedDevices.cam.set(callSettings.selectedCam.value);
          } else {
            console.error('Failed to update stream', error);
            await stopStream();
            await initPublisher();
          }
        }
      );
  };

  const updateStream = async () => {
    if (!publisher.current) {
      await initPublisher();
    } else {
      await updatePublisher();
    }
  };

  const stopStream = async () => {
    await session.current.unpublish(publisher.current);
    publisher.current = undefined;
    setLocal(undefined);
  };

  const subscribeToScreenShareEnd = () => {
    publisher.current.stream
      .getMediaStream()
      .getVideoTracks()[0]
      .addEventListener('ended', () => {
        selectedDevices.cam.set(callSettings.selectedCam.value);
      });
  };

  const toggleCam = () => callSettings.camEnabled.set(e => !e);
  const toggleMic = () => callSettings.micEnabled.set(e => !e);
  const toggleSound = () => callSettings.soundEnabled.set(e => !e);
  const toggleScreenShare = () => {
    if (selectedDevices.cam.value === 'screen') {
      publisher.current?.publishVideo(false);
      selectedDevices.cam.set(callSettings.selectedCam.value);
    } else {
      selectedDevices.cam.set('screen');
    }
  };

  const hangupMutation = useMutation(roomId => hangupCall(roomId));
  const handleHangup = () => {
    session.current.disconnect();
    queryClient.setQueryData(roomKeys.token(room._id), () => {});
    hangupMutation.mutate(room._id);
  };
  useBeforeunload(handleHangup);

  const startRecordingMutation = useMutation(roomId => startRecording(roomId));
  const stopRecordingMutation = useMutation(roomId => stopRecording(roomId));

  const handleRecording = () =>
    callSession.data?.recording
      ? stopRecordingMutation.mutate(room._id)
      : startRecordingMutation.mutate(room._id);

  useEffect(async () => {
    await connectToSession();
    await updateStream();
  }, []);

  useEffect(async () => {
    if (session.current.connection) {
      await updateStream();
    }
  }, [selectedDevices.cam.value, selectedDevices.mic.value]);

  useEffect(() => {
    publisher.current?.publishVideo(
      selectedDevices.cam.value === 'screen'
        ? true
        : callSettings.camEnabled.value
    );
  }, [callSettings.camEnabled.value]);

  useEffect(() => {
    publisher.current?.publishAudio(callSettings.micEnabled.value);
  }, [callSettings.micEnabled.value]);

  useEffect(() => {
    selectedDevices.batch(s => {
      if (s.cam !== 'screen') s.cam.set(callSettings.selectedCam.value);
      s.mic.set(callSettings.selectedMic.value);
    });
  }, [callSettings.selectedCam.value, callSettings.selectedMic.value]);

  if (error)
    return (
      <Center {...rest}>
        <VStack spacing={4}>
          <Text>Connection failed, please try again</Text>
          <Button onClick={() => window.location.reload()} borderRadius="full">
            Reload
          </Button>
        </VStack>
      </Center>
    );

  return (
    <>
      <Center position="relative" pb={20} {...rest}>
        <Box m={4} w="100%" h="100%">
          <VideoGrid
            videos={[...(local ? [local] : []), ...peers]}
            users={room.users}
            spacing={4}
          />
        </Box>

        <Box position="absolute" bottom={0}>
          <SlideFade in offsetY="20px">
            <HStack m={4} spacing={4} flexWrap="wrap" justifyContent="center">
              <IconButton
                onClick={handleHangup}
                size="lg"
                borderRadius="full"
                colorScheme="red"
              >
                <MdCallEnd size={24} />
              </IconButton>
              <IconButton onClick={toggleSound} size="lg" borderRadius="full">
                {callSettings.soundEnabled.value ? (
                  <MdVolumeUp size={24} />
                ) : (
                  <MdVolumeOff size={24} />
                )}
              </IconButton>
              {callSettings.selectedMic.value && (
                <IconButton onClick={toggleMic} size="lg" borderRadius="full">
                  {callSettings.micEnabled.value ? (
                    <MdMic size={24} />
                  ) : (
                    <MdMicOff size={24} />
                  )}
                </IconButton>
              )}
              {callSettings.selectedCam.value && (
                <IconButton onClick={toggleCam} size="lg" borderRadius="full">
                  {callSettings.camEnabled.value ? (
                    <MdVideocam size={24} />
                  ) : (
                    <MdVideocamOff size={24} />
                  )}
                </IconButton>
              )}
              <IconButton
                onClick={toggleScreenShare}
                size="lg"
                borderRadius="full"
              >
                {selectedDevices.cam.value === 'screen' ? (
                  <MdStopScreenShare size={24} />
                ) : (
                  <MdScreenShare size={24} />
                )}
              </IconButton>
              {own && (
                <IconButton
                  onClick={handleRecording}
                  isLoading={
                    startRecordingMutation.isLoading ||
                    stopRecordingMutation.isLoading
                  }
                  p={3}
                  size="lg"
                  borderRadius="full"
                  colorScheme={callSession.data?.recording ? 'red' : undefined}
                  color={callSession.data?.recording ? undefined : 'red.500'}
                >
                  <HStack>
                    <BsRecordFill size={24} />
                    {callSession.data?.recording && (
                      <Box pr={2}>
                        <ElapsedTimeText
                          since={callSession.data?.recordingStartedAt}
                        />
                      </Box>
                    )}
                  </HStack>
                </IconButton>
              )}
            </HStack>
          </SlideFade>
        </Box>
      </Center>

      <Prompt message={handleHangup} />
    </>
  );
};

export default CallScreen;

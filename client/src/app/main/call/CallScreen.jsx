import { Button, IconButton } from '@chakra-ui/button';
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/layout';
import { SlideFade } from '@chakra-ui/transition';
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

  const [showControls] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [error, setError] = useState(false);
  const [local, setLocal] = useState();
  const [peers, setPeers] = useState([]);

  const queryClient = useQueryClient();
  const callSettings = useCallSettings();
  const callSession = useOpenViduSession(room._id);
  const initializing = useRef();
  const publisher = useRef();
  const session = useRef();

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
    publisher.current = await openvidu.initPublisherAsync(undefined, {
      publishVideo: callSettings.camEnabled.value,
      publishAudio: callSettings.micEnabled.value,
      videoSource: callSettings.selectedCam.value || false,
      audioSource: callSettings.selectedMic.value || false,
      mirror: false,
      filter: callSettings.nameOverlay.value
        ? {
            type: 'GStreamerFilter',
            options: {
              command: `textoverlay text="${user.data.name}" valignment=top halignment=right font-desc="Cantarell 16"`,
            },
          }
        : undefined,
    });
    setLocal(publisher.current);
  };

  const publishStream = async () => {
    if (initializing.current) return;

    try {
      if (!publisher.current) {
        initializing.current = true;
        await initPublisher();
        await session.current.publish(publisher.current);
        initializing.current = false;
      } else {
        await openvidu
          .getUserMedia({
            videoSource: screenShare
              ? 'screen'
              : callSettings.selectedCam.value || false,
            audioSource: callSettings.selectedMic.value || false,
          })
          .then(
            async stream => {
              const videoTracks = stream.getVideoTracks();
              const audioTracks = stream.getAudioTracks();

              if (
                !publisher.current.stream.hasVideo ||
                !publisher.current.stream.hasAudio
              ) {
                // TODO: Have to create a new publisher to add/remove tracks
              } else {
                if (videoTracks.length > 0 && publisher.current.stream.hasVideo)
                  await publisher.current.replaceTrack(videoTracks[0]);
                if (audioTracks.length > 0 && publisher.current.stream.hasAudio)
                  await publisher.current.replaceTrack(audioTracks[0]);

                // TODO: Resubscribe to speaking events on the local video
                // Have to set it again manually because of a bug
                publisher.current.videoReference.muted = true;
              }

              publisher.current.publishVideo(
                screenShare ? true : callSettings.camEnabled.value
              );

              if (screenShare) {
                publisher.current.stream
                  .getMediaStream()
                  .getVideoTracks()[0]
                  .addEventListener('ended', () => setScreenShare(false));
              }
            },
            error => {
              if (screenShare) {
                console.error('Failed to share screen', error);
                setScreenShare(false);
              }
            }
          );
      }
    } catch (err) {
      console.error('Failed to publish stream', err);
      setError(true);
    }
  };

  const toggleCam = () => callSettings.camEnabled.set(e => !e);
  const toggleMic = () => callSettings.micEnabled.set(e => !e);
  const toggleSound = () => callSettings.soundEnabled.set(e => !e);
  const toggleScreenShare = () => setScreenShare(!screenShare);

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
    await publishStream();
  }, []);

  useEffect(async () => {
    await publishStream();
  }, [
    callSettings.selectedCam.value,
    callSettings.selectedMic.value,
    screenShare,
  ]);

  useEffect(() => {
    publisher.current?.publishVideo(
      screenShare ? true : callSettings.camEnabled.value
    );
  }, [callSettings.camEnabled.value]);

  useEffect(() => {
    publisher.current?.publishAudio(callSettings.micEnabled.value);
  }, [callSettings.micEnabled.value]);

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
            videos={[local, ...peers]}
            users={room.users}
            spacing={4}
          />
        </Box>

        <Box position="absolute" bottom={0}>
          <SlideFade in={showControls} offsetY="20px">
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
              <IconButton onClick={toggleMic} size="lg" borderRadius="full">
                {callSettings.micEnabled.value ? (
                  <MdMic size={24} />
                ) : (
                  <MdMicOff size={24} />
                )}
              </IconButton>
              <IconButton onClick={toggleCam} size="lg" borderRadius="full">
                {callSettings.camEnabled.value ? (
                  <MdVideocam size={24} />
                ) : (
                  <MdVideocamOff size={24} />
                )}
              </IconButton>
              <IconButton
                onClick={toggleScreenShare}
                size="lg"
                borderRadius="full"
              >
                {screenShare ? (
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

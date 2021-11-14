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
import { hangupCall } from '../../../core/api';
import { openvidu } from '../../../core/openvidu';
import { roomKeys } from '../../../core/query';
import { useCallSettings } from '../../../core/store';
import VideoGrid from './VideoGrid';

const CallScreen = props => {
  const { room, callToken, ...rest } = props;

  const [showControls] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [error, setError] = useState(false);
  const [local, setLocal] = useState();
  const [peers, setPeers] = useState([]);

  const queryClient = useQueryClient();
  const callSettings = useCallSettings();
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
          <VideoGrid videos={[local, ...peers]} spacing={4} />
        </Box>

        <Box position="absolute" bottom={0}>
          <SlideFade in={showControls} offsetY="20px">
            <HStack m={4} spacing={4}>
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
              <IconButton size="lg" borderRadius="full" color="red.500">
                <BsRecordFill size={24} />
              </IconButton>
            </HStack>
          </SlideFade>
        </Box>
      </Center>

      <Prompt message={handleHangup} />
    </>
  );
};

export default CallScreen;

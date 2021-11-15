import { Avatar } from '@chakra-ui/avatar';
import { Box, Center, Circle, Text } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { Fade } from '@chakra-ui/transition';
import React, { useEffect, useRef, useState } from 'react';
import { MdMicOff } from 'react-icons/md';

const Video = props => {
  const { streamManager, users, ...rest } = props;

  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [streamProperties, setStreamProperties] = useState({
    videoActive: undefined,
    audioActive: undefined,
    hasAudio: true,
    hasVideo: true,
    typeOfVideo: undefined,
    data: {},
  });

  const video = useRef();

  const updateStreamProperties = () =>
    setStreamProperties({
      videoActive: streamManager.stream.videoActive,
      audioActive: streamManager.stream.audioActive,
      hasAudio: streamManager.stream.hasAudio,
      hasVideo: streamManager.stream.hasVideo,
      typeOfVideo: streamManager.stream.typeOfVideo,
      data: streamManager.stream.connection.data,
    });

  useEffect(() => {
    if (!streamManager || !video.current) return;

    try {
      setLoading(true);
      streamManager.once('streamPlaying', () => {
        setLoading(false);
        updateStreamProperties();
      });
      streamManager.on('publisherStartSpeaking', () => setSpeaking(true));
      streamManager.on('publisherStopSpeaking', () => setSpeaking(false));
      streamManager.on('streamPropertyChanged', () => updateStreamProperties());
      streamManager.addVideoElement(video.current);
    } catch (err) {
      console.error('Failed to add video element', err);
    }

    return () => {
      streamManager.off('publisherStartSpeaking');
      streamManager.off('publisherStopSpeaking');
      streamManager.off('streamPropertyChanged');
    };
  }, [streamManager]);

  return (
    <Box
      bg="black"
      borderRadius="xl"
      position="relative"
      overflow="hidden"
      {...rest}
    >
      <video
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

      {!loading && (
        <>
          {!streamProperties.videoActive && (
            <Center
              position="absolute"
              top={0}
              left={0}
              bottom={0}
              right={0}
              bgGradient="radial-gradient(var(--chakra-colors-blue-700) 0%, #17192333 100%);"
            >
              <Avatar
                name={users.find(u => u._id === streamProperties.data)?.name}
                src={users.find(u => u._id === streamProperties.data)?.picture}
                size="2xl"
                boxShadow={
                  speaking && '0px 0px 0px 4px var(--chakra-colors-green-400)'
                }
                transition="box-shadow 0.25s"
              />
            </Center>
          )}

          {!streamProperties.audioActive && (
            <Circle position="absolute" bottom={3} right={3} bg="red.500" p={2}>
              <MdMicOff size={20} color="white" />
            </Circle>
          )}

          <Box
            position="absolute"
            bottom={3}
            left={3}
            p={2}
            borderRadius="lg"
            bg="blackAlpha.700"
          >
            <Text color="white">
              {users.find(u => u._id === streamProperties.data)?.name}
            </Text>
          </Box>

          <Fade in={speaking}>
            <Box
              position="absolute"
              top={1}
              left={1}
              right={1}
              bottom={1}
              borderRadius="lg"
              boxShadow="0px 0px 0px 12px var(--chakra-colors-green-400)"
            />
          </Fade>
        </>
      )}

      <Fade in={loading}>
        <Center position="absolute" top={0} left={0} right={0} bottom={0}>
          <Spinner color="white" size="xl" top={0} />
        </Center>
      </Fade>
    </Box>
  );
};

export default Video;

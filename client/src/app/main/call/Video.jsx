import { Box, Center } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { Fade } from '@chakra-ui/transition';
import React, { useEffect, useRef, useState } from 'react';

const Video = props => {
  const { streamManager, ...rest } = props;

  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const video = useRef();

  useEffect(() => {
    if (!streamManager || !video.current) return;

    try {
      setLoading(true);
      streamManager.once('streamPlaying', () => setLoading(false));
      streamManager.on('publisherStartSpeaking', () => setSpeaking(true));
      streamManager.on('publisherStopSpeaking', () => setSpeaking(false));
      streamManager.addVideoElement(video.current);
    } catch (err) {
      console.error('Failed to add video element', err);
    }
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
      <Fade in={loading}>
        <Center position="absolute" top={0} left={0} right={0} bottom={0}>
          <Spinner color="white" size="xl" top={0} />
        </Center>
      </Fade>
    </Box>
  );
};

export default Video;

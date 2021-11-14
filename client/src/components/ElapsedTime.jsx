import { Text } from '@chakra-ui/layout';
import React, { useEffect } from 'react';
import { useElapsedTime } from 'use-elapsed-time';
import useWindowFocus from 'use-window-focus';
import { toHHMMSS } from '../core/utils';

const ElapsedTimeText = props => {
  const { since, ...rest } = props;

  const windowFocused = useWindowFocus();

  const { elapsedTime: elapsedTimeInSeconds, reset: resetTimer } =
    useElapsedTime({
      updateInterval: 1,
      isPlaying: !!since,
    });

  useEffect(() => {
    const currentTime = new Date();
    const startTime = since ? new Date(since) : currentTime;
    const startAt = (currentTime - startTime) / 1000;

    resetTimer(startAt);
  }, [since, windowFocused]);

  const displayTime = toHHMMSS(elapsedTimeInSeconds);

  return (
    <Text w={`${displayTime.length * 10}px`} {...rest}>
      {displayTime}
    </Text>
  );
};

export default ElapsedTimeText;

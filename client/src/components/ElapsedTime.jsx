import { Text } from '@chakra-ui/layout';
import React, { useEffect } from 'react';
import { useElapsedTime } from 'use-elapsed-time';
import { toHHMMSS } from '../core/utils';

const ElapsedTimeText = props => {
  const { since, ...rest } = props;

  const currentTime = new Date();
  const startTime = since ? new Date(since) : currentTime;
  const { elapsedTime: elapsedTimeInSeconds, reset: resetTimer } =
    useElapsedTime({
      updateInterval: 1,
      isPlaying: !!since,
      startAt: (currentTime - startTime) / 1000,
    });

  useEffect(() => {
    resetTimer();
  }, [since]);

  const displayTime = toHHMMSS(elapsedTimeInSeconds);

  return (
    <Text w={`${displayTime.length * 10}px`} {...rest}>
      {displayTime}
    </Text>
  );
};

export default ElapsedTimeText;

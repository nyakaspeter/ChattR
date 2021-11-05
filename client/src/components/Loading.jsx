import { Center, Text, VStack } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import React from 'react';

export const Loading = props => {
  const { text, fullscreen, ...rest } = props;

  return (
    <Center w={fullscreen ? '100vw' : '100%'} h={fullscreen ? '100vh' : '100%'}>
      <VStack spacing={4}>
        <Spinner size="xl" {...rest} />
        {text && <Text>{text}</Text>}
      </VStack>
    </Center>
  );
};

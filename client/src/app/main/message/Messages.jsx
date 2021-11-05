import { VStack } from '@chakra-ui/layout';
import React from 'react';
import MessageForm from './MessageForm';
import MessageList from './MessageList';

const Messages = props => {
  const { room, ...rest } = props;

  return (
    <VStack {...rest} alignItems="stretch" spacing={0}>
      <MessageList flex="1" room={room} />
      <MessageForm room={room} />
    </VStack>
  );
};

export default Messages;

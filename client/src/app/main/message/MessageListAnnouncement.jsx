import { Text } from '@chakra-ui/layout';
import React from 'react';

const MessageListAnnouncement = props => {
  const { message, sender, ...rest } = props;

  const messageText = () => {
    switch (message.type) {
      case 'roomCreated':
        return 'created the room';
      case 'roomUpdated':
        return 'updated the room';
      case 'userJoined':
        return 'joined the room';
      case 'userLeft':
        return 'left the room';
    }
  };

  return (
    <Text {...rest} fontSize="sm" opacity={0.8} noOfLines={1} p={1}>
      <b>{sender.name}</b> {messageText()}
    </Text>
  );
};

export default MessageListAnnouncement;

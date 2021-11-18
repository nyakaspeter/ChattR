import { Avatar, AvatarBadge } from '@chakra-ui/avatar';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { Flex, HStack, Text, VStack } from '@chakra-ui/layout';
import React from 'react';
import { Link } from 'react-router-dom';
import { useOpenViduSession } from '../../../core/query';

const RoomListItem = props => {
  const { room, selected } = props;

  const selectionColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  const callSession = useOpenViduSession(room._id);

  const messageSender = () => room.lastMessage.sender.name.split(' ')[0];

  const messageText = () => {
    switch (room.lastMessage.type) {
      case 'text':
        if (room.lastMessage.text) return room.lastMessage.text;
        else return `Sent ${room.lastMessage.files?.length} files`;
      case 'callStarted':
        return 'Started call';
      case 'callEnded':
        return 'Call ended';
      case 'roomUpdated':
        return 'Updated room';
      case 'userJoined':
        return 'Joined room';
      case 'userLeft':
        return 'Left room';
      case 'recordingStarted':
        return 'Started recording';
      case 'recordingEnded':
        return 'Ended recording';
    }
  };

  return (
    <Flex
      as={Link}
      to={`/r/${room._id}`}
      flex="1"
      borderRadius="lg"
      p={2}
      alignItems="center"
      bg={selected ? selectionColor : 'transparent'}
      _hover={{ bg: hoverColor }}
    >
      <HStack spacing={3}>
        <Avatar
          name={room.name}
          src={room.image && `/api/room/${room._id}/image?id=${room.image}`}
          boxShadow={
            callSession.data?.recording
              ? '0px 0px 0px 3px var(--chakra-colors-red-600)'
              : callSession.data?.active
              ? '0px 0px 0px 3px var(--chakra-colors-green-400)'
              : undefined
          }
        >
          {room.onlineUserCount > 1 && (
            <AvatarBadge boxSize={4} bg="green.400" />
          )}
        </Avatar>
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" noOfLines="1" wordBreak="break-all">
            {room.name}
          </Text>
          {room.lastMessage && room.lastMessage.type !== 'roomCreated' && (
            <Text fontSize="sm" noOfLines="1" wordBreak="break-all">
              {`${messageSender()}: ${messageText()}`}
            </Text>
          )}
        </VStack>
      </HStack>
    </Flex>
  );
};

export default RoomListItem;

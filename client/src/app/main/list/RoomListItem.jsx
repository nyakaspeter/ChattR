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
            callSession.data?.active &&
            '0px 0px 0px 3px var(--chakra-colors-green-400)'
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
          {room.lastMessage && (
            <Text fontSize="sm" noOfLines="1" wordBreak="break-all">
              {`${room.lastMessage.sender.name.split(' ')[0]}: ${
                room.lastMessage.text
              }`}
            </Text>
          )}
        </VStack>
      </HStack>
    </Flex>
  );
};

export default RoomListItem;

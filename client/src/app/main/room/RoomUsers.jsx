import { Avatar, AvatarBadge } from '@chakra-ui/avatar';
import { IconButton } from '@chakra-ui/button';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, VStack } from '@chakra-ui/layout';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { joinRoomAccept, joinRoomDecline } from '../../../core/api';
import { roomKeys } from '../../../core/query';

const RoomUsers = props => {
  const { room, ...rest } = props;

  const queryClient = useQueryClient();

  const acceptMutation = useMutation(
    ({ roomId, userId }) => joinRoomAccept(roomId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(roomKeys.info(room._id));
      },
    }
  );

  const declineMutation = useMutation(
    ({ roomId, userId }) => joinRoomDecline(roomId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(roomKeys.info(room._id));
      },
    }
  );

  return (
    <VStack px={3} py={1} spacing={3} alignItems="stretch" {...rest}>
      {room.usersWhoRequestedToJoin && room.usersWhoRequestedToJoin.length > 0 && (
        <>
          <Text fontSize="sm" textTransform="uppercase">
            Pending approvals
          </Text>
          {room.usersWhoRequestedToJoin.map(user => (
            <HStack key={user._id} spacing={3}>
              <Avatar name={user.name} src={user.picture}>
                {user.online && <AvatarBadge boxSize={4} bg="green.400" />}
              </Avatar>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" noOfLines="1" wordBreak="break-all">
                  {user.name}
                </Text>
                <Text fontSize="sm" noOfLines="1" wordBreak="break-all">
                  {user.email}
                </Text>
              </VStack>
              <Box flex="1" />
              <IconButton
                onClick={() =>
                  acceptMutation.mutate({
                    roomId: room._id,
                    userId: user._id,
                  })
                }
                isLoading={acceptMutation.isLoading}
                size="sm"
                borderRadius="full"
                colorScheme="green"
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={() =>
                  declineMutation.mutate({
                    roomId: room._id,
                    userId: user._id,
                  })
                }
                isLoading={declineMutation.isLoading}
                size="sm"
                borderRadius="full"
                colorScheme="red"
              >
                <CloseIcon />
              </IconButton>
            </HStack>
          ))}
          <Text fontSize="sm" textTransform="uppercase">
            Room members
          </Text>
        </>
      )}

      {room.users.map(user => (
        <HStack key={user._id} spacing={3}>
          <Avatar name={user.name} src={user.picture}>
            {user.online && <AvatarBadge boxSize={4} bg="green.400" />}
          </Avatar>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" noOfLines="1" wordBreak="break-all">
              {user.name}
            </Text>
            <Text fontSize="sm" noOfLines="1" wordBreak="break-all">
              {user.email}
            </Text>
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
};

export default RoomUsers;

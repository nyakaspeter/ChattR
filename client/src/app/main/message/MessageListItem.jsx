import { Avatar, AvatarBadge } from '@chakra-ui/avatar';
import { Button } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { DownloadIcon } from '@chakra-ui/icons';
import { Circle, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/layout';
import React from 'react';
import { FaRegFile } from 'react-icons/fa';
import { MdCall, MdCallEnd } from 'react-icons/md';
import { useMutation } from 'react-query';
import { useOpenViduToken } from '../../../core/query';
import { toHHMMSS } from '../../../core/utils';

const MessageListItem = props => {
  const { own, roomId, message, sender, showAvatar, ...rest } = props;

  const messageBg = useColorModeValue('gray.200', 'gray.600');
  const ownMessageBg = useColorModeValue('blue.100', 'blue.600');
  const fileBg = useColorModeValue('blackAlpha.200', 'blackAlpha.300');

  const callToken = useOpenViduToken(roomId);
  const callMutation = useMutation(callToken.refetch);
  const handleJoinCall = () => callMutation.mutate();

  const MessageAvatar = (
    <Avatar
      w="10"
      h="10"
      name={sender.name}
      src={sender.picture}
      opacity={showAvatar ? 1 : 0}
    >
      {sender.online && <AvatarBadge boxSize={4} bg="green.400" />}
    </Avatar>
  );

  return (
    <HStack
      {...rest}
      alignItems="flex-end"
      w={message.files?.length > 0 ? '100%' : 'initial'}
    >
      {!own && MessageAvatar}
      <VStack
        flex="1"
        bg={own ? ownMessageBg : messageBg}
        p={2}
        borderRadius="xl"
        alignItems="start"
      >
        {message.text && (
          <Text whiteSpace="pre-wrap" wordBreak="break-word">
            {message.text}
          </Text>
        )}

        {message.type === 'callStarted' && (
          <HStack p={2} borderRadius="lg" w="100%" spacing={4}>
            <Circle bg="green.500" h={10} w={10}>
              <MdCall size={20} color="white" />
            </Circle>
            <Text fontWeight="bold" flex="1">
              {sender.name} started a call
            </Text>
            {!callToken.data?.token && (
              <Button
                onClick={handleJoinCall}
                isLoading={callMutation.isLoading}
              >
                Join
              </Button>
            )}
          </HStack>
        )}

        {message.type === 'callEnded' && (
          <HStack p={2} borderRadius="lg" w="100%" spacing={4}>
            <Circle bg="red.600" h={10} w={10}>
              <MdCallEnd size={20} color="white" />
            </Circle>
            <Text fontWeight="bold" flex="1">
              Call ended
            </Text>
            <Button>{toHHMMSS(message.length / 1000)}</Button>
          </HStack>
        )}

        {/* <Text whiteSpace="pre-wrap" wordBreak="break-word">
          {JSON.stringify(message, null, 2)}
        </Text> */}
        {message.files?.length > 0 && (
          <SimpleGrid
            alignSelf="stretch"
            minChildWidth={200}
            maxH={204}
            spacingX={2}
            spacingY={2}
            overflowY="auto"
            overflowX="hidden"
          >
            {message.files.map(file => (
              <HStack
                key={file.id}
                p={2.5}
                bg={fileBg}
                borderRadius="md"
                flex="1"
              >
                <FaRegFile size={20} />
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  noOfLines="1"
                  wordBreak="break-all"
                  textOverflow="ellipsis"
                  flex="1"
                >
                  {file.originalname}
                </Text>
                <Button
                  as="a"
                  href={`/api/room/${roomId}/message/${message._id}/files/${file.id}/download`}
                  size="xs"
                  borderRadius="full"
                  colorScheme="blue"
                  p={0}
                >
                  <DownloadIcon fontSize="xs" />
                </Button>
              </HStack>
            ))}
          </SimpleGrid>
        )}
      </VStack>
      {own && MessageAvatar}
    </HStack>
  );
};

export default MessageListItem;

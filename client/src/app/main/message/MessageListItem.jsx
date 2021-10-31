import { Avatar } from '@chakra-ui/avatar';
import { Button } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { Center, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/layout';
import React from 'react';
import { FaRegFile } from 'react-icons/fa';

const MessageListItem = props => {
  const { own, roomId, message, sender, showAvatar, ...rest } = props;

  const messageBg = useColorModeValue('gray.200', 'gray.600');
  const ownMessageBg = useColorModeValue('blue.100', 'blue.600');
  const fileBg = useColorModeValue('blackAlpha.200', 'blackAlpha.300');

  const MessageAvatar = (
    <Avatar
      w="10"
      h="10"
      name={sender.name}
      src={sender.picture}
      opacity={showAvatar ? 1 : 0}
    />
  );

  return (
    <HStack
      {...rest}
      alignItems="flex-end"
      w={message.files.length > 0 ? '100%' : 'initial'}
    >
      {!own && MessageAvatar}
      <VStack
        flex="1"
        bg={own ? ownMessageBg : messageBg}
        p={2}
        borderRadius="xl"
        alignItems="start"
      >
        <Text whiteSpace="pre-wrap">{message.text}</Text>
        {message.files.length > 0 && (
          <SimpleGrid
            alignSelf="stretch"
            minChildWidth={200}
            maxH={204}
            spacingX={2}
            spacingY={2}
            overflowY="auto"
            overflowX="hidden"
          >
            {message.files.map((file, i) => (
              <Button
                as="a"
                href={`/api/room/${roomId}/message/${message._id}/files/${file.id}/download`}
                key={i}
                bg={fileBg}
                p={3}
                borderRadius="md"
              >
                <HStack maxW="100%">
                  <FaRegFile size={20} />
                  <Text fontSize="sm" isTruncated>
                    {file.originalname}
                  </Text>
                </HStack>
              </Button>
            ))}
          </SimpleGrid>
        )}
      </VStack>
      {own && MessageAvatar}
    </HStack>
  );
};

export default MessageListItem;

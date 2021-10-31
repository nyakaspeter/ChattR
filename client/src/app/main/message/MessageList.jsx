import { IconButton } from '@chakra-ui/button';
import { ArrowDownIcon } from '@chakra-ui/icons';
import { VStack } from '@chakra-ui/layout';
import { Fade } from '@chakra-ui/transition';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from '../../../components/ScrollView';
import { useAuth } from '../../../core/api';
import MessageListItem from './MessageListItem';

const MessageList = props => {
  const { room, messages, users, ...rest } = props;

  const user = useAuth();

  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollbar = useRef();

  const lastRoomId = useRef();
  const lastMessageId = useRef();

  function handleScroll(values) {
    if (values.top === 1 || values.scrollHeight === values.clientHeight) {
      setCanScrollDown(false);
    } else {
      setCanScrollDown(true);
    }
  }

  function scrollToBottom() {
    scrollbar.current?.scrollToBottom();
    setCanScrollDown(false);
  }

  useEffect(() => {
    // Scroll to bottom on switching room

    if (room._id !== lastRoomId.current) {
      scrollToBottom();
    }

    lastRoomId.current = room._id;
  }, [room]);

  useEffect(() => {
    // Scroll to bottom on new message, if already was scrolled to bottom

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?._id !== lastMessageId.current && !canScrollDown) {
      scrollToBottom();
    }

    lastMessageId.current = lastMessage?._id;
  }, [messages, canScrollDown]);

  return (
    <VStack {...rest} position="relative">
      <ScrollView ref={scrollbar} onScrollFrame={handleScroll}>
        <Fade in>
          <VStack p={2}>
            {messages.map((message, i) => {
              const own = message.sender === user.data._id;
              const lastMessageBySender =
                messages[i + 1]?.sender !== message.sender;

              return (
                <MessageListItem
                  key={i}
                  roomId={room._id}
                  message={message}
                  own={own}
                  alignSelf={own ? 'flex-end' : 'flex-start'}
                  maxW="80%"
                  showAvatar={lastMessageBySender}
                  sender={users?.find(u => u._id === message.sender)}
                />
              );
            })}
          </VStack>
        </Fade>
      </ScrollView>
      {canScrollDown && (
        <IconButton
          position="absolute"
          bottom={2}
          borderRadius="3xl"
          colorScheme="blue"
          onClick={scrollToBottom}
        >
          <ArrowDownIcon fontSize="xl" />
        </IconButton>
      )}
    </VStack>
  );
};

export default MessageList;

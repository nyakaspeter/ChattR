import { IconButton } from '@chakra-ui/button';
import { ArrowDownIcon } from '@chakra-ui/icons';
import { VStack } from '@chakra-ui/layout';
import { Fade } from '@chakra-ui/transition';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from '../../../components/ScrollView';
import { useMessages, useUser } from '../../../core/query';
import MessageListAnnouncement from './MessageListAnnouncement';
import MessageListItem from './MessageListItem';

const MessageList = props => {
  const { room, ...rest } = props;
  const roomUsers = [...room.users, ...room.usersWhoLeft];

  const user = useUser();
  const messages = useMessages(room._id);

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

    if (!messages.data) return;

    const lastMessage = messages.data[messages.data.length - 1];

    if (lastMessage?._id !== lastMessageId.current && !canScrollDown) {
      scrollToBottom();
    }

    lastMessageId.current = lastMessage?._id;
  }, [messages.data, canScrollDown]);

  if (!messages.isSuccess) return <VStack {...rest} />;

  return (
    <VStack {...rest} position="relative">
      <ScrollView ref={scrollbar} onScrollFrame={handleScroll}>
        <Fade in>
          <VStack p={2}>
            {messages.data.map((message, i) => {
              const own = message.sender === user.data._id;
              const lastMessageBySender =
                messages.data[i + 1]?.sender !== message.sender;

              switch (message.type) {
                case 'text':
                case 'callStarted':
                case 'callEnded':
                case 'recordingStarted':
                case 'recordingEnded':
                  return (
                    <MessageListItem
                      key={message._id}
                      roomId={room._id}
                      message={message}
                      own={own}
                      alignSelf={own ? 'flex-end' : 'flex-start'}
                      maxW="80%"
                      showAvatar={lastMessageBySender}
                      sender={roomUsers?.find(u => u._id === message.sender)}
                    />
                  );
                case 'roomCreated':
                case 'roomUpdated':
                case 'userJoined':
                case 'userLeft':
                  return (
                    <MessageListAnnouncement
                      key={message._id}
                      message={message}
                      sender={roomUsers?.find(u => u._id === message.sender)}
                      alignSelf="center"
                    />
                  );
              }
            })}
          </VStack>
        </Fade>
      </ScrollView>
      {canScrollDown && (
        <IconButton
          position="absolute"
          bottom={2}
          borderRadius="full"
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

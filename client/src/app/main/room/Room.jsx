import { VStack } from '@chakra-ui/layout';
import { Fade } from '@chakra-ui/transition';
import React from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useQuery } from 'react-query';
import { getMessages, getRoom, getSessionToken } from '../../../core/api';
import { openvidu } from '../../../core/openvidu';
import MessageForm from '../message/MessageForm';
import MessageList from '../message/MessageList';
import RoomHeader from './RoomHeader';
import RoomJoin from './RoomJoin';

const sessionQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnmount: false,
  refetchOnReconnect: false,
  retry: false,
  staleTime: Infinity,
};

const Room = props => {
  const { roomId, ...rest } = props;

  const room = useQuery(['room', roomId], () => getRoom(roomId), {
    retry: (failureCount, error) =>
      failureCount < 3 && error.response.status !== 403,
  });

  const messages = useQuery(['messages', roomId], () => getMessages(roomId), {
    enabled: room.isSuccess,
  });

  // const session = useQuery(
  //   ['session', roomId],
  //   () => connectToSession(),
  //   sessionQueryOptions
  // );

  async function connectToSession() {
    const token = await getSessionToken(roomId);
    const session = openvidu.initSession();

    session.on('connectionCreated', event => {
      //store.onlineUsers.merge([event.connection.data]);
    });

    session.on('connectionDestroyed', event => {
      //store.onlineUsers.set((users) => users.filter((user) => user !== event.connection.data));
    });

    session.on('streamCreated', event => {
      //const stream = session.current.subscribe(event.stream, undefined);
      //store.remoteStreams.merge([stream]);
    });

    session.on('streamDestroyed', event => {
      //const idx = store.remoteStreams.attach(Downgraded).get().indexOf(event.stream.streamManager);
      //store.remoteStreams[idx].set(none);
    });

    session.on('recordingStarted', event => {
      //store.recording.set(true);
    });

    session.on('recordingStopped', event => {
      //store.recording.set(false);
    });

    session.on('signal:message', event => {
      //const message = JSON.parse(event.data);
      //store.messages.merge([message]);
    });

    session.on('signal:roomUpdated', event => {
      //const room = JSON.parse(event.data);
      //store.room.merge(room);
    });

    session.on('signal:roomDeleted', event => {
      //history.push("/");
    });

    await session.connect(token);

    return session;
  }

  function disconnectFromSession() {
    //session.current.disconnect();
  }

  useBeforeunload(event => {
    //disconnectFromSession();
  });

  if (room.isLoading && !room.error?.response?.data) return null;

  if (room.isError || room.error?.response?.data)
    return (
      <>
        {room.error?.response?.data && (
          <RoomJoin {...rest} room={room.error.response.data} />
        )}
      </>
    );

  return (
    <VStack {...rest} alignItems="stretch" spacing={0}>
      <RoomHeader room={room.data} />

      {messages.isSuccess && (
        <>
          <MessageList
            flex="1"
            room={room.data}
            messages={messages.data}
            users={[...room.data.users, ...room.data.usersWhoLeft]}
          />
          <MessageForm room={room.data} />
        </>
      )}
    </VStack>
  );
};

export default Room;

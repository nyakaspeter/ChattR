import { Flex } from '@chakra-ui/layout';
import React from 'react';
import { useParams } from 'react-router';
import { useSocket } from '../../core/socketio';
import RoomList from './list/RoomList';
import Room from './room/Room';

const Main = props => {
  const { roomId } = useParams();
  const socket = useSocket();

  return (
    <Flex h="100vh">
      <RoomList w="360px" borderWidth="0 1px 0 0" />
      {roomId && <Room flex="1" roomId={roomId} />}
    </Flex>
  );
};

export default Main;

import { Flex, HStack, VStack } from '@chakra-ui/layout';
import { useState } from 'react';
import { useRoom } from '../../core/api';
import { useSocket } from '../../core/socketio';
import RoomList from './list/RoomList';
import MessageForm from './message/MessageForm';
import MessageList from './message/MessageList';
import Room from './room/Room';
import RoomHeader from './room/RoomHeader';
import RoomJoin from './room/RoomJoin';
import SidePanel from './sidepanel/SidePanel';

const Main = props => {
  const socket = useSocket();

  return (
    <Flex w="100vw" h="100vh">
      <RoomList flex="1" maxWidth="360px" borderRightWidth="1px" />
      <Room flex="3" />
    </Flex>
  );
};

export default Main;

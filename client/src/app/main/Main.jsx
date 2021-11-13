import { Flex } from '@chakra-ui/layout';
import React from 'react';
import { useSocket } from '../../core/query';
import { useUiState } from '../../core/store';
import RoomList from './list/RoomList';
import Room from './room/Room';

const Main = () => {
  useSocket();

  const uiState = useUiState();

  return (
    <Flex w="100vw" h="100vh">
      {uiState.showRoomList.value && (
        <RoomList flex="1" maxWidth="360px" borderRightWidth="1px" />
      )}
      <Room flex="3" />
    </Flex>
  );
};

export default Main;

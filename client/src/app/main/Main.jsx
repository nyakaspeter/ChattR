import { IconButton } from '@chakra-ui/button';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/media-query';
import { Drawer, DrawerContent, DrawerOverlay } from '@chakra-ui/modal';
import React from 'react';
import { useSocket } from '../../core/query';
import { useUiState } from '../../core/store';
import RoomList from './list/RoomList';
import Room from './room/Room';

const Main = () => {
  useSocket();

  const uiState = useUiState();
  const permanentDrawer = useBreakpointValue({ base: false, xl: true });

  const handleToggleRoomList = () => uiState.showRoomList.set(s => !s);

  return (
    <>
      <Flex w="100vw" h="100vh" position="relative">
        {!uiState.showRoomList.value && (
          <Box position="absolute" top={4} left={3}>
            <IconButton
              onClick={handleToggleRoomList}
              borderRadius="full"
              zIndex={2}
            >
              <HamburgerIcon />
            </IconButton>
          </Box>
        )}
        {permanentDrawer && uiState.showRoomList.value && (
          <RoomList
            flex="1"
            maxW="360px"
            overflow="hidden"
            borderRightWidth="1px"
          />
        )}
        <Room flex="3" />
      </Flex>

      <Drawer
        placement="left"
        isOpen={!permanentDrawer && uiState.showRoomList.value}
        onClose={() => uiState.showRoomList.set(false)}
      >
        <DrawerOverlay />
        <DrawerContent>
          <RoomList flex="1" />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Main;

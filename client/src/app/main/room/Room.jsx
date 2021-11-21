import { HStack, VStack } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/media-query';
import { Drawer, DrawerContent, DrawerOverlay } from '@chakra-ui/modal';
import React, { useEffect } from 'react';
import { Redirect, useParams } from 'react-router';
import {
  useOpenViduSession,
  useOpenViduToken,
  useRoom,
} from '../../../core/query';
import { useUiState } from '../../../core/store';
import CallScreen from '../call/CallScreen';
import Messages from '../message/Messages';
import SidePanel from '../sidepanel/SidePanel';
import RoomHeader from './RoomHeader';
import RoomJoin from './RoomJoin';

const Room = props => {
  const { roomId } = useParams();

  const uiState = useUiState();
  const permanentDrawer = useBreakpointValue({ base: false, xl: true });

  const room = useRoom(roomId);
  const callSession = useOpenViduSession(roomId);
  const callToken = useOpenViduToken(roomId);
  const inCall = !!callToken.data?.token;

  useEffect(() => {
    if (permanentDrawer) {
      // If we use permanent panels
      if (inCall) {
        // Set sidepanel to messages and hide room list on entering call
        uiState.showRoomList.set(false);
        uiState.currentPanel.set({ title: 'Messages', content: Messages });
      } else {
        // Close sidepanel and show room list on leaving call
        uiState.showRoomList.set(true);
        uiState.currentPanel.set(null);
      }
    } else {
      // If we use drawers, close them on size change
      uiState.showRoomList.set(false);
      uiState.currentPanel.set(null);
    }
  }, [inCall, permanentDrawer]);

  useEffect(() => {
    // Close sidepanel on switching room
    uiState.currentPanel.set(null);

    // Hide room list drawer on switching room
    if (!permanentDrawer) {
      uiState.showRoomList.set(false);
    }
  }, [roomId, permanentDrawer]);

  return (
    <>
      <HStack {...props} alignItems="stretch" spacing={0}>
        {room.isSuccess && (
          <>
            <VStack flex="2" alignItems="stretch" spacing={0}>
              <RoomHeader
                room={room.data}
                inCall={inCall}
                callSession={callSession.data}
              />
              {inCall ? (
                <CallScreen
                  flex="1"
                  room={room.data}
                  callToken={callToken.data}
                />
              ) : (
                <Messages flex="1" room={room.data} />
              )}
            </VStack>

            {permanentDrawer && !!uiState.currentPanel.value && (
              <SidePanel
                flex="1"
                maxW="360px"
                overflow="hidden"
                borderLeftWidth="1px"
                title={uiState.currentPanel?.title?.value}
                content={uiState.currentPanel?.content?.value}
                room={room.data}
              />
            )}

            <Drawer
              placement="right"
              isOpen={!permanentDrawer && !!uiState.currentPanel.value}
              onClose={() => uiState.currentPanel.set(null)}
            >
              <DrawerOverlay />
              <DrawerContent>
                <SidePanel
                  flex="1"
                  title={uiState.currentPanel?.title?.value}
                  content={uiState.currentPanel?.content?.value}
                  room={room.data}
                />
              </DrawerContent>
            </Drawer>
          </>
        )}

        {room.error && (
          <>
            {room.error.response?.data?.room ? (
              <RoomJoin flex="1" room={room.error.response.data.room} />
            ) : (
              <Redirect to="/r" />
            )}
          </>
        )}
      </HStack>
    </>
  );
};

export default Room;

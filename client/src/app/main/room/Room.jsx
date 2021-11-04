import { HStack, VStack } from '@chakra-ui/layout';
import React, { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { useRoom } from '../../../core/api';
import Messages from '../message/Messages';
import SidePanel from '../sidepanel/SidePanel';
import RoomHeader from './RoomHeader';
import RoomJoin from './RoomJoin';

const Room = props => {
  const { roomId } = useParams();

  const room = useRoom(roomId);

  const [panel, setPanel] = useState(null);
  const [inCall, setInCall] = useState(false);

  const handleOpenPanel = panel => setPanel(panel);
  const handleClosePanel = () => setPanel(null);

  useEffect(() => {
    // Close sidepanel on switching room

    setPanel(null);
  }, [room.data]);

  return (
    <HStack {...props} alignItems="stretch">
      {room.isSuccess && (
        <>
          <VStack flex="2" alignItems="stretch" spacing={0}>
            <RoomHeader room={room.data} onOpenPanel={handleOpenPanel} />
            <Messages flex="1" room={room.data} />
          </VStack>

          {panel && (
            <SidePanel
              flex="1"
              maxWidth="360px"
              borderLeftWidth="1px"
              title={panel.title}
              content={panel.content}
              onClose={handleClosePanel}
            />
          )}
        </>
      )}

      {room.error?.response?.data && (
        <RoomJoin flex="1" room={room.error.response.data} />
      )}

      {room.isError && !room.error?.response?.data && <Redirect to="/r" />}
    </HStack>
  );
};

export default Room;

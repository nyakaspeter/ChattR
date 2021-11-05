import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import { Box, Text, VStack } from '@chakra-ui/layout';
import { Fade } from '@chakra-ui/transition';
import React, { useMemo, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { ScrollView } from '../../../components/ScrollView';
import { useRooms } from '../../../core/api';
import RoomListHeader from './RoomListHeader';
import RoomListItem from './RoomListItem';

const RoomList = props => {
  const { roomId: currentRoomId } = useParams();

  const rooms = useRooms();

  const [filter, setFilter] = useState('');

  const filteredRooms = useMemo(
    () =>
      rooms.data?.rooms
        ? rooms.data.rooms
            .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        : [],
    [rooms.data?.rooms, filter]
  );

  const filteredPending = useMemo(
    () =>
      rooms.data?.pending
        ? rooms.data.pending
            .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [rooms.data?.pending, filter]
  );

  return (
    <VStack {...props} alignItems="stretch">
      <RoomListHeader p={3} />
      {rooms.isSuccess && (
        <>
          {!currentRoomId && rooms.data.rooms.length > 0 && (
            <Redirect to={`/r/${filteredRooms[0]._id}`} />
          )}

          {(rooms.data.rooms.length > 0 || rooms.data.pending.length > 0) && (
            <Box px={2} pb={3}>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  children={<SearchIcon color="gray.500" />}
                />
                <Input
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  borderRadius="full"
                  variant="filled"
                  placeholder="Search rooms"
                />
              </InputGroup>
            </Box>
          )}

          <ScrollView>
            <Fade in>
              <VStack px={2} alignItems="stretch" overflow="auto">
                {rooms.data.pending.length > 0 && (
                  <>
                    <Text fontSize="sm" px={2} textTransform="uppercase">
                      Pending approvals
                    </Text>
                    {filteredPending.map(room => (
                      <RoomListItem
                        key={room._id}
                        room={room}
                        selected={room._id === currentRoomId}
                      />
                    ))}
                    {rooms.data.rooms.length > 0 && (
                      <Text fontSize="sm" px={2} textTransform="uppercase">
                        My rooms
                      </Text>
                    )}
                  </>
                )}

                {filteredRooms.map(room => (
                  <RoomListItem
                    key={room._id}
                    room={room}
                    selected={room._id === currentRoomId}
                  />
                ))}
              </VStack>
            </Fade>
          </ScrollView>

          <Box />
        </>
      )}
    </VStack>
  );
};

export default RoomList;

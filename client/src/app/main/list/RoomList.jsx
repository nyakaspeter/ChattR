import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import { Box, VStack } from '@chakra-ui/layout';
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
      rooms.data
        ? rooms.data
            .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        : [],
    [rooms, filter]
  );

  return (
    <VStack {...props} alignItems="stretch">
      <RoomListHeader p={3} />
      {rooms.isSuccess && rooms.data.length > 0 && (
        <>
          {!currentRoomId && <Redirect to={`/r/${filteredRooms[0]._id}`} />}

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

          <ScrollView>
            <Fade in>
              <VStack px={2} alignItems="stretch" overflow="auto">
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

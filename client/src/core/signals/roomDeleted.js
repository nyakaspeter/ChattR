import { queryClient, roomKeys } from '../query.js';

export const handleRoomDeleted = e => {
  queryClient.updateQueryData(roomKeys.list(), old => {
    return {
      ...old,
      rooms: old.rooms.filter(r => r._id !== e.roomId),
    };
  });

  queryClient.refetchQueries(roomKeys.info(e.roomId));
};

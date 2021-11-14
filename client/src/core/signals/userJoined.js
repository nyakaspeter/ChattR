import { queryClient, roomKeys } from '../query.js';

export const handleUserJoined = e => {
  queryClient.updateQueryData(roomKeys.info(e.roomId), old => ({
    ...old,
    users: [...old.users, e.user],
  }));

  queryClient.updateQueryData(roomKeys.list(), old => {
    const rooms = [...old.rooms];
    const updatedRoom = rooms.find(r => r._id === e.roomId);

    updatedRoom.onlineUserCount++;

    return {
      ...old,
      rooms,
    };
  });
};

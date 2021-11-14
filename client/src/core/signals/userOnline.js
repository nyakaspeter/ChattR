import { queryClient, roomKeys } from '../query.js';

export const handleUserOnline = e => {
  queryClient.updateQueryData(roomKeys.info(e.roomId), old => {
    const users = [...old.users];
    const updatedUser = users.find(u => u._id === e.userId);
    updatedUser.online = true;

    return {
      ...old,
      users,
    };
  });

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

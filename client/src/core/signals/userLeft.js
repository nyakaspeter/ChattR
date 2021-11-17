import { queryClient, roomKeys } from '../query.js';

export const handleUserLeft = e => {
  queryClient.updateQueryData(roomKeys.info(e.roomId), old => ({
    ...old,
    users: old.users.filter(u => u._id !== e.sender._id),
    usersWhoLeft: [...old.usersWhoLeft, e.sender],
  }));

  queryClient.updateQueryData(roomKeys.list(), old => {
    const rooms = [...old.rooms];
    const updatedRoom = rooms.find(r => r._id === e.roomId);

    updatedRoom.onlineUserCount--;

    return {
      ...old,
      rooms,
    };
  });

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

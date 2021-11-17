import { queryClient, roomKeys } from '../query.js';

export const handleUserJoined = e => {
  queryClient.updateQueryData(roomKeys.info(e.roomId), old => ({
    ...old,
    users: [...old.users, e.sender],
    usersWhoLeft: old.usersWhoLeft.filter(u => u._id !== e.sender._id),
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

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

import { queryClient, roomKeys } from '../query.js';

export const handleRoomUpdated = e => {
  queryClient.updateQueryData(roomKeys.list(), old => {
    const rooms = [...old.rooms];
    const updatedRoom = rooms.find(r => r._id === e.roomId);

    updatedRoom.image = e.room.image;
    updatedRoom.name = e.room.name;
    updatedRoom.description = e.room.description;
    updatedRoom.privacy = e.room.privacy;

    return {
      ...old,
      rooms,
    };
  });

  queryClient.updateQueryData(roomKeys.info(e.roomId), old => ({
    ...old,
    image: e.room.image,
    name: e.room.name,
    description: e.room.description,
    privacy: e.room.privacy,
  }));

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

import { queryClient, roomKeys } from '../query.js';

export const handleCallStarted = async e => {
  await queryClient.cancelQueries(roomKeys.session(e.roomId));

  queryClient.setQueryData(roomKeys.session(e.roomId), () => ({
    active: true,
    createdAt: e.message.date,
  }));

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

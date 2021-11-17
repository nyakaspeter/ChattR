import { queryClient, roomKeys } from '../query.js';

export const handleMessage = async e => {
  await queryClient.cancelQueries(roomKeys.messageList(e.roomId));

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

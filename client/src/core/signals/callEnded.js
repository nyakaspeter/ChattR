import { queryClient, roomKeys } from '../query.js';

export const handleCallEnded = async e => {
  await queryClient.cancelQueries(roomKeys.session(e.roomId));

  queryClient.setQueryData(roomKeys.session(e.roomId), () => ({
    active: false,
  }));

  // Removing call started message
  queryClient.updateQueryData(roomKeys.messageList(e.roomId), old =>
    old.filter(message => message._id !== e.prevMessageId)
  );

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

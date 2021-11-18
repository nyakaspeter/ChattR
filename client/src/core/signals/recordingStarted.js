import { queryClient, roomKeys } from '../query';

export const handleRecordingStarted = async e => {
  await queryClient.cancelQueries(roomKeys.session(e.roomId));

  queryClient.updateQueryData(roomKeys.session(e.roomId), old => ({
    ...old,
    recording: true,
    recordingStartedAt: e.message.date,
  }));

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

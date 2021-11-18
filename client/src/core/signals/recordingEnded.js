import { queryClient, roomKeys } from '../query';

export const handleRecordingEnded = async e => {
  await queryClient.cancelQueries(roomKeys.session(e.roomId));

  queryClient.setQueryData(roomKeys.session(e.roomId), old => ({
    ...old,
    recording: false,
    recordingStartedAt: undefined,
  }));

  // Removing recording started message
  queryClient.updateQueryData(roomKeys.messageList(e.roomId), old =>
    old.filter(
      message =>
        !(
          message.type === 'recordingStarted' &&
          message.recording === e.message.recording
        )
    )
  );

  queryClient.updateMessages(e.roomId, e.message);
  queryClient.updateLastMessage(e.roomId, e.message, e.sender);
};

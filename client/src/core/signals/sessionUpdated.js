import { queryClient, roomKeys } from '../query.js';

export const handleSessionUpdated = async e => {
  await queryClient.cancelQueries(roomKeys.session(e.roomId));

  queryClient.setQueryData(roomKeys.session(e.roomId), () => e.session);
};

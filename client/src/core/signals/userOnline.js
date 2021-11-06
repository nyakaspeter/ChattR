import { queryClient, roomKeys } from '../query.js';

export const handleUserOnline = e => {
  // TODO: setQueryData instead of refetching

  queryClient.invalidateQueries(roomKeys.list());
  queryClient.invalidateQueries(roomKeys.info(e.roomId));
};

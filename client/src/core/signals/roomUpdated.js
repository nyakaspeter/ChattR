import { queryClient, roomKeys } from '../query.js';

export const handleRoomUpdated = e => {
  // TODO: setQueryData instead of refetching

  queryClient.invalidateQueries(roomKeys.list());
  queryClient.invalidateQueries(roomKeys.info(e.roomId));
};

import { queryClient, roomKeys } from '../query.js';

export const handleRoomDeleted = e => {
  // TODO: setQueryData instead of refetching

  queryClient.invalidateQueries(roomKeys.list());
  queryClient.removeQueries(roomKeys.info(e.roomId));
};

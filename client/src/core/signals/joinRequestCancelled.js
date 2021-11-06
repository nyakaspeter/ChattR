import { queryClient, roomKeys } from '../query.js';

export const handleJoinRequestCancelled = e => {
  // TODO: setQueryData instead of refetching

  queryClient.invalidateQueries(roomKeys.info(e.roomId));
};

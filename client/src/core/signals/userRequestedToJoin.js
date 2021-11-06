import { queryClient, roomKeys } from '../query.js';

export const handleUserRequestedToJoin = e => {
  // TODO: setQueryData instead of refetching

  queryClient.invalidateQueries(roomKeys.info(e.roomId));
};

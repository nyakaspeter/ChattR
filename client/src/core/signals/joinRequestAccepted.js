import { queryClient, roomKeys } from '../query.js';

export const handleJoinRequestAccepted = e => {
  queryClient.invalidateQueries(roomKeys.list());
  queryClient.refetchQueries(roomKeys.info(e.roomId));
};

import { queryClient, roomKeys } from '../query.js';

export const handleJoinRequestDeclined = e => {
  queryClient.updateQueryData(roomKeys.list(), old => {
    return {
      ...old,
      pending: old.pending.filter(r => r._id !== e.roomId),
    };
  });

  queryClient.invalidateQueries(roomKeys.info(e.roomId));
};

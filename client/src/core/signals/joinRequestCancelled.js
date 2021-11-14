import { queryClient, roomKeys } from '../query.js';

export const handleJoinRequestCancelled = e => {
  queryClient.updateQueryData(roomKeys.info(e.roomId), old => {
    return {
      ...old,
      usersWhoRequestedToJoin: old.usersWhoRequestedToJoin.filter(
        u => u._id !== e.userId
      ),
    };
  });
};

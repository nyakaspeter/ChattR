import { queryClient, roomKeys } from '../query.js';

export const handleJoinRequest = e => {
  queryClient.updateQueryData(roomKeys.info(e.roomId), old => ({
    ...old,
    usersWhoRequestedToJoin: [...old.usersWhoRequestedToJoin, e.user],
  }));
};

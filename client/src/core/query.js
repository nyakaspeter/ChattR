import { QueryClient, useQuery } from 'react-query';
import { getMessages, getRoom, getRooms, getUser } from './api';
import { wsConnect } from './socketio';

export const queryClient = new QueryClient();

export const userKeys = {
  all: () => ['user'],
  current: () => [...userKeys.all(), 'current'],
};

export const socketKeys = {
  all: () => ['socket'],
  current: () => [...socketKeys.all(), 'current'],
};

export const roomKeys = {
  all: () => ['room'],
  list: () => [...roomKeys.all(), 'list'],
  infos: () => [...roomKeys.all(), 'info'],
  info: id => [...roomKeys.infos(), id],
  messageLists: () => [...roomKeys.all(), 'messages'],
  messageList: id => [...roomKeys.messageLists(), id],
};

export const useUser = options => {
  const queryOptions = {
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
  };

  return useQuery(userKeys.current(), () => getUser(), options || queryOptions);
};

export const useSocket = options => {
  const queryOptions = {};

  return useQuery(
    socketKeys.current(),
    () => wsConnect(),
    options || queryOptions
  );
};

export const useRooms = options => {
  const queryOptions = {};

  return useQuery(roomKeys.list(), () => getRooms(), options || queryOptions);
};

export const useRoom = (roomId, options) => {
  const queryOptions = {
    enabled: !!roomId,
    retry: (failureCount, error) =>
      failureCount < 3 &&
      error.response?.status !== 403 &&
      error.response?.status !== 404,
  };

  return useQuery(
    roomKeys.info(roomId),
    () => getRoom(roomId),
    options || queryOptions
  );
};

export const useMessages = (roomId, options) => {
  const queryOptions = {};

  return useQuery(
    roomKeys.messageList(roomId),
    () => getMessages(roomId),
    options || queryOptions
  );
};

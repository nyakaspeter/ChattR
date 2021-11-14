import { QueryClient, useQuery } from 'react-query';
import {
  getMessages,
  getRoom,
  getRooms,
  getRoomSession,
  getRoomToken,
  getUser,
} from './api';
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
  sessions: () => [...roomKeys.all(), 'session'],
  session: id => [...roomKeys.sessions(), id],
  tokens: () => [...roomKeys.all(), 'token'],
  token: id => [...roomKeys.tokens(), id],
};

export const useUser = options => {
  const queryOptions = {
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
  };

  return useQuery(userKeys.current(), () => getUser(), {
    ...queryOptions,
    ...options,
  });
};

export const useSocket = options => {
  const queryOptions = {
    retry: true,
  };

  return useQuery(socketKeys.current(), () => wsConnect(), {
    ...queryOptions,
    ...options,
  });
};

export const useRooms = options => {
  const queryOptions = {
    refetchOnMount: false,
  };

  return useQuery(roomKeys.list(), () => getRooms(), {
    ...queryOptions,
    ...options,
  });
};

export const useRoom = (roomId, options) => {
  const queryOptions = {
    enabled: !!roomId,
    retry: (failureCount, error) =>
      failureCount < 3 &&
      error.response?.status !== 403 &&
      error.response?.status !== 404,
    refetchOnMount: false,
  };

  return useQuery(roomKeys.info(roomId), () => getRoom(roomId), {
    ...queryOptions,
    ...options,
  });
};

export const useMessages = (roomId, options) => {
  const queryOptions = {
    refetchOnMount: false,
  };

  return useQuery(roomKeys.messageList(roomId), () => getMessages(roomId), {
    ...queryOptions,
    ...options,
  });
};

export const useOpenViduSession = (roomId, options) => {
  const queryOptions = {
    enabled: !!roomId,
  };

  return useQuery(roomKeys.session(roomId), () => getRoomSession(roomId), {
    ...queryOptions,
    ...options,
  });
};

export const useOpenViduToken = (roomId, options) => {
  const queryOptions = {
    enabled: false,
  };

  return useQuery(roomKeys.token(roomId), () => getRoomToken(roomId), {
    ...queryOptions,
    ...options,
  });
};

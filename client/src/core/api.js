import axios from 'axios';
import { QueryClient, useQuery } from 'react-query';

const api = axios.create({ baseURL: '/api' });

export const queryClient = new QueryClient();

export async function getUser() {
  return (await api.get('user')).data;
}

export async function getRooms() {
  return (await api.get('rooms')).data;
}

export async function createRoom(roomFormData) {
  return (await api.post(`room/create`, roomFormData)).data;
}

export async function updateRoom(roomId, roomFormData) {
  return (await api.post(`room/${roomId}/update`, roomFormData)).data;
}

export async function joinRoom(roomId, joinFormData) {
  return (await api.post(`room/${roomId}/join`, joinFormData)).data;
}

export async function leaveRoom(roomId) {
  return (await api.get(`room/${roomId}/leave`)).data;
}

export async function deleteRoom(roomId) {
  return (await api.get(`room/${roomId}/delete`)).data;
}

export async function getRoom(roomId) {
  return (await api.get(`room/${roomId}/info`)).data;
}

export async function getMessages(roomId) {
  return (await api.get(`room/${roomId}/messages`)).data;
}

export async function sendMessage(roomId, messageFormData) {
  return (await api.post(`room/${roomId}/message/send`, messageFormData)).data;
}

export async function getSessionToken(roomId) {
  return (await api.get(`room/${roomId}/token`)).data;
}

export const useUser = () => {
  const queryOptions = {
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
  };

  return useQuery('user', () => getUser(), queryOptions);
};

export const useRooms = () => useQuery('rooms', () => getRooms());

export const useRoom = roomId =>
  useQuery(['room', roomId], () => getRoom(roomId), {
    enabled: !!roomId,
    retry: (failureCount, error) =>
      failureCount < 3 &&
      error.response?.status !== 403 &&
      error.response?.status !== 404,
  });

export const useMessages = roomId =>
  useQuery(['room', roomId, 'messages'], () => getMessages(roomId));

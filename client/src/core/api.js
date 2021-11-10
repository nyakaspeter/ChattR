import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Setup debug logging
api.interceptors.response.use(res => {
  console.log(`${res.config.method.toUpperCase()} ${res.config.url}`, res.data);
  return res;
});

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

export async function joinRoomCancel(roomId) {
  return (await api.get(`room/${roomId}/join/cancel`)).data;
}

export async function joinRoomAccept(roomId, userId) {
  return (await api.get(`room/${roomId}/join/${userId}/accept`)).data;
}

export async function joinRoomDecline(roomId, userId) {
  return (await api.get(`room/${roomId}/join/${userId}/decline`)).data;
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

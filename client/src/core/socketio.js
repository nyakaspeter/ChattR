import { useQuery } from 'react-query';
import io from 'socket.io-client';
import { queryClient } from './api';

let socket;

export async function wsConnect() {
  if (socket?.connected) {
    return socket;
  }

  socket?.disconnect();
  socket = io.connect('/');

  socket.on('connect', () => {
    return socket;
  });

  socket.on('connect_error', err => {
    throw err;
  });

  socket.on('disconnect', () => {
    queryClient.invalidateQueries('socket');
  });

  socket.on('message', async e => {
    const queryKey = ['room', e.roomId, 'messages'];
    await queryClient.cancelQueries(queryKey);

    queryClient.setQueryData(queryKey, old => {
      if (old) {
        const message = old.find(message => message._id === e.message._id);
        return message ? old : [...old, e.message];
      }
      return [e.message];
    });

    queryClient.setQueryData('rooms', old => {
      const rooms = [...old];
      const lastMessage = { ...e.message };
      lastMessage.sender = e.sender;

      const room = rooms.find(r => r._id === e.roomId);
      room.lastMessage = lastMessage;
      room.lastActivity = e.message.date;

      return rooms;
    });
  });
}

export const useSocket = () => {
  return useQuery('socket', () => wsConnect());
};

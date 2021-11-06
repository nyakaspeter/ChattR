import io from 'socket.io-client';
import { queryClient, roomKeys, socketKeys } from './query';

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
    queryClient.invalidateQueries(socketKeys.current());
  });

  socket.on('message', async e => {
    await queryClient.cancelQueries(roomKeys.messageList(e.roomId));

    queryClient.setQueryData(roomKeys.messageList(e.roomId), old => {
      if (old) {
        const message = old.find(message => message._id === e.message._id);
        return message ? old : [...old, e.message];
      }
      return [e.message];
    });

    queryClient.setQueryData(roomKeys.list(), old => {
      const rooms = old.rooms;
      const pending = old.pending;

      const lastMessage = { ...e.message };
      lastMessage.sender = e.sender;

      const room = rooms.find(r => r._id === e.roomId);
      room.lastMessage = lastMessage;
      room.lastActivity = e.message.date;

      return { rooms, pending };
    });
  });
}

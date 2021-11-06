import socketio from '../config/socketio.js';

export const signalMessage = async (roomId, sender, message) => {
  socketio.emitToRoom(roomId, 'message', {
    sender: {
      _id: sender._id,
      name: sender.name,
      picture: sender.picture,
      online: sender.online,
    },
    message: message,
  });
};

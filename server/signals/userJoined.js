import socketio from '../config/socketio.js';

export const signalUserJoined = async (roomId, userId) => {
  socketio.emitToRoom(roomId, 'userJoined', { userId });
};

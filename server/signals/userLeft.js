import socketio from '../config/socketio.js';

export const signalUserLeft = async (roomId, userId) => {
  socketio.emitToRoom(roomId, 'userLeft', { userId }, userId);
};

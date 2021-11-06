import socketio from '../config/socketio.js';

export const signalJoinRequestDeclined = async (roomId, userId) => {
  socketio.emitToUser(userId, 'joinRequestDeclined', { roomId });
};

import socketio from '../config/socketio.js';

export const signalJoinRequestAccepted = async (roomId, userId) => {
  socketio.emitToUser(userId, 'joinRequestAccepted', { roomId });
};

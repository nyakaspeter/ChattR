import socketio from '../config/socketio.js';

export const signalSessionUpdated = async (roomId, session) => {
  socketio.emitToRoom(roomId, 'sessionUpdated', { session });
};

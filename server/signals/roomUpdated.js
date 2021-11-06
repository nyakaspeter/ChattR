import socketio from '../config/socketio.js';

export const signalRoomUpdated = async (roomId, room) => {
  socketio.emitToRoom(roomId, 'roomUpdated', { room });
};

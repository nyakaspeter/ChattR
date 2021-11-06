import socketio from '../config/socketio.js';

export const signalRoomDeleted = async roomId => {
  socketio.emitToRoom(roomId, 'roomDeleted');
};

import socketio from '../config/socketio.js';
import Room from '../models/room.js';

export const signalUserRequestedToJoin = async (roomId, userId) => {
  const owner = (await Room.findById(roomId, 'owner').lean()).owner;

  socketio.emitToUser(owner, 'userRequestedToJoin', { roomId, userId });
};

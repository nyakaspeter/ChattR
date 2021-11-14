import socketio from '../config/socketio.js';
import Room from '../models/room.js';
import User from '../models/user.js';

export const signalJoinRequest = async (roomId, userId) => {
  const owner = (await Room.findById(roomId, 'owner').lean()).owner;

  const user = await User.findById(userId, 'name picture email online').lean();

  socketio.emitToUser(owner, 'joinRequest', { roomId, user });
};

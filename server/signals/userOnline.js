import socketio from '../config/socketio.js';
import Room from '../models/room.js';

export const signalUserOnline = async userId => {
  const rooms = await Room.find({ users: userId }, '_id').lean();
  const pending = await Room.find(
    { usersWhoRequestedToJoin: userId },
    '_id'
  ).lean();

  [...rooms, ...pending].forEach(room =>
    socketio.emitToRoom(room._id, 'userOnline', { userId })
  );
};

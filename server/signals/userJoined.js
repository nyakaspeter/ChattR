import socketio from '../config/socketio.js';
import User from '../models/user.js';

export const signalUserJoined = async (roomId, userId) => {
  const user = await User.findById(userId, 'name picture email online').lean();

  socketio.emitToRoom(roomId, 'userJoined', { user }, userId);
};

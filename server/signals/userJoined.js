import mongoose from '../config/mongoose.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';
import User from '../models/user.js';

export const signalUserJoined = async (roomId, userId) => {
  const sender = await User.findById(
    userId,
    'name picture email online'
  ).lean();

  const message = {
    _id: new mongoose.Types.ObjectId(),
    type: 'userJoined',
    sender: new mongoose.Types.ObjectId(sender._id),
    date: new Date(),
  };

  await Room.findByIdAndUpdate(roomId, {
    lastActivity: message.date,
    $push: { messages: message },
  });

  socketio.emitToRoom(roomId, 'userJoined', { message, sender }, userId);
};

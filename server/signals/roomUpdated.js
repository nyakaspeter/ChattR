import mongoose from '../config/mongoose.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';

export const signalRoomUpdated = async (roomId, room, user) => {
  const message = {
    _id: new mongoose.Types.ObjectId(),
    type: 'roomUpdated',
    sender: new mongoose.Types.ObjectId(user._id),
    date: new Date(),
  };

  await Room.findByIdAndUpdate(roomId, {
    lastActivity: message.date,
    $push: { messages: message },
  });

  socketio.emitToRoom(roomId, 'roomUpdated', { room, message, sender: user });
};

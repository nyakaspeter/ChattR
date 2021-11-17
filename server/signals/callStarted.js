import mongoose from '../config/mongoose.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';

export const signalCallStarted = async (roomId, caller, date) => {
  const message = {
    _id: new mongoose.Types.ObjectId(),
    type: 'callStarted',
    sender: new mongoose.Types.ObjectId(caller._id),
    date: new Date(date),
  };

  await Room.findByIdAndUpdate(roomId, {
    lastActivity: message.date,
    $push: { messages: message },
  });

  socketio.emitToRoom(roomId, 'callStarted', { message, sender: caller });
};

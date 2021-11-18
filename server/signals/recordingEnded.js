import mongoose from '../config/mongoose.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';

export const signalRecordingEnded = async (
  roomId,
  recording,
  recordingUser
) => {
  // Remove recording started message
  await Room.findByIdAndUpdate(roomId, {
    $pull: { messages: { type: 'recordingStarted', recording: recording.id } },
  });

  const message = {
    _id: new mongoose.Types.ObjectId(),
    type: 'recordingEnded',
    sender: recordingUser._id,
    date: new Date(),
    recording: recording.id,
    length: recording.duration * 1000,
  };

  await Room.findByIdAndUpdate(roomId, {
    lastActivity: message.date,
    $push: { messages: message },
  });

  socketio.emitToRoom(roomId, 'recordingEnded', {
    message,
    sender: recordingUser,
  });
};

import mongoose from '../config/mongoose.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';

export const signalRecordingStarted = async (
  roomId,
  recording,
  recordingUser
) => {
  const message = {
    _id: new mongoose.Types.ObjectId(),
    type: 'recordingStarted',
    sender: new mongoose.Types.ObjectId(recordingUser._id),
    date: new Date(recording.createdAt),
    recording: recording.id,
  };

  await Room.findByIdAndUpdate(roomId, {
    lastActivity: message.date,
    $push: { messages: message },
  });

  socketio.emitToRoom(roomId, 'recordingStarted', {
    message,
    sender: recordingUser,
  });
};

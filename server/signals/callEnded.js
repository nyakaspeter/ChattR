import mongoose from '../config/mongoose.js';
import { ovClient } from '../config/openvidu.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';
import User from '../models/user.js';
import { signalRecordingEnded } from './recordingEnded.js';

export const signalCallEnded = async roomId => {
  // If there was an active recording, stop it
  const session = ovClient.activeSessions.find(s => s.sessionId === roomId);
  if (session?.recordingId) {
    try {
      const recording = await ovClient.stopRecording(session.recordingId);
      await signalRecordingEnded(roomId, recording, session.recordingUser);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  // Finding all call started messages
  const callStartedMessages = (
    await Room.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(roomId) } },
      {
        $addFields: {
          messages: {
            $filter: {
              input: '$messages',
              cond: { $eq: ['$$this.type', 'callStarted'] },
            },
          },
        },
      },
    ]).project('messages')
  )[0].messages;

  // Removing all call started messages
  await Room.findByIdAndUpdate(roomId, {
    $pull: { messages: { _id: callStartedMessages.map(m => m._id) } },
  });

  const lastCallStartedMessage =
    callStartedMessages[callStartedMessages.length - 1];
  if (!lastCallStartedMessage) return;

  const currentDate = new Date();
  const callLength = currentDate - new Date(lastCallStartedMessage.date);

  const message = {
    _id: new mongoose.Types.ObjectId(),
    type: 'callEnded',
    sender: lastCallStartedMessage.sender,
    date: currentDate,
    length: callLength,
  };

  await Room.findByIdAndUpdate(roomId, {
    lastActivity: message.date,
    $push: { messages: message },
  });

  const sender = await User.findById(message.sender, 'name picture');

  socketio.emitToRoom(roomId, 'callEnded', {
    message,
    sender,
    prevMessageId: lastCallStartedMessage._id,
  });
};

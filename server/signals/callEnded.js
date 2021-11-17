import mongoose from '../config/mongoose.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';
import User from '../models/user.js';

export const signalCallEnded = async roomId => {
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

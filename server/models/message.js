import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
  type: {
    type: String,
    enum: [
      'text',
      'callStarted',
      'callEnded',
      'recordingStarted',
      'recordingEnded',
      'roomCreated',
      'roomUpdated',
      'userJoined',
      'userLeft',
    ],
    default: 'text',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  text: {
    type: String,
    maxLength: 1000,
  },
  files: {
    type: [
      {
        type: Object,
      },
    ],
    default: undefined,
  },
  length: {
    type: Number,
  },
  recording: {
    type: String,
  },
});

const Message = { schema: messageSchema };

export default Message;

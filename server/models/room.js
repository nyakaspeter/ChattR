import mongoose from 'mongoose';
import Message from './message.js';

const roomSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    maxLength: 300,
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
  },
  privacy: {
    type: String,
  },
  password: {
    type: String,
    maxLength: 100,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [Message.schema],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  usersWhoLeft: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  usersWhoRequestedToJoin: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  lastActivity: {
    type: Date,
    required: true,
  },
});

const Room = mongoose.model('Room', roomSchema);

export default Room;

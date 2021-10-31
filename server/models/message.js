import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
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
    required: false,
    maxLength: 1000,
  },
  files: [
    {
      type: Object,
    },
  ],
});

const Message = { schema: messageSchema };

export default Message;

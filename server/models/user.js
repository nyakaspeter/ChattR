import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  email: {
    type: String,
    required: false,
    maxLength: 100,
  },
  picture: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  online: {
    type: Boolean,
  },
});

const User = mongoose.model('User', userSchema);

export default User;

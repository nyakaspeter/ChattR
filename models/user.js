import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

export default User;

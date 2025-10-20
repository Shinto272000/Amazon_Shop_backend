
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phoneNumber: {
    type: String,
    sparse: true,
  },
  googleId: {
    type: String,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', userSchema);

export default User;

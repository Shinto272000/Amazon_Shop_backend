
import mongoose from 'mongoose';

const emailOtpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  },
});

const EmailOTPVerification = mongoose.model(
  'EmailOTPVerification',
  emailOtpVerificationSchema
);

export default EmailOTPVerification;

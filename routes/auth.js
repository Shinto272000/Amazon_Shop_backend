
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import EmailOTPVerification from '../models/EmailOTPVerification.js';

const router = express.Router();

// Nodemailer transporter setup
// IMPORTANT: You need to configure these environment variables in your .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail password or app password
  },
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&userId=${req.user._id}`);
  }
);


// POST /auth/check-user
router.post('/check-user', async (req, res) => {
  const { identifier: email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { identifier: email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Please sign in with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ success: true, token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /auth/send-otp
router.post('/send-otp', async (req, res) => {
  console.log('Request to /send-otp received with body:', req.body);
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    await EmailOTPVerification.create({
      fullName,
      email,
      otp: hashedOTP,
      password: hashedPassword,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  console.log('Request to /verify-otp received with body:', req.body);
  const { email, otp } = req.body;

  try {
    const otpEntry = await EmailOTPVerification.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const isMatch = await bcrypt.compare(otp, otpEntry.otp);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const newUser = await User.create({
      fullName: otpEntry.fullName,
      email: otpEntry.email,
      password: otpEntry.password,
      isVerified: true,
    });

    await EmailOTPVerification.deleteOne({ _id: otpEntry._id });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ success: true, token, userId: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /auth/user/:id
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;

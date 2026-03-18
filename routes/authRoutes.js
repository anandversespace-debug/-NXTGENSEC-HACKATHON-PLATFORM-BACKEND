const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'nxg_secret_fallback_2026';

// 1. Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('nxg_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        onboarded: user.onboarded
      }
    });

  } catch (error) {
    console.error('[AUTH_ERROR] Login failure:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 2. Registration
router.post('/register', async (req, res) => {
  const { email, password, name, username, role } = req.body;
  
  if (!email || !password || !name || !username) {
    return res.status(400).json({ error: 'All fields are required for registration.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      username,
      role: role || 'developer',
      contributions: 0,
      skills: [],
      onboarded: false
    });

    const { getVerificationTemplate } = require('../utils/emailTemplates');
    const { sendEmail } = require('../config/nodemailer');
    const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?email=${encodeURIComponent(email)}`;
    
    sendEmail(email, 'Verify Your Account - NxtGenSec', getVerificationTemplate(actionLink, name))
       .catch(err => console.error('[MAIL_ERROR] Verification email failed:', err));

    res.status(201).json({ 
       success: true, 
       message: 'Account created successfully. Please check your email for verification.',
       user: { id: newUser._id, email: newUser.email, username: newUser.username, onboarded: false }
    });

  } catch (error) {
     console.error('[AUTH_ERROR] Registration Failure:', error.message);
     res.status(500).json({ error: 'Failed to create account. Please try again later.' });
  }
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, new_password } = req.body;
  
  if (!email || !new_password) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
     console.error('[AUTH_ERROR] Password Reset Failure:', error.message);
     res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// 4. Initial Node Setup (Create Admin)
router.post('/setup', async (req, res) => {
  const { setup_key, email, password, name, username } = req.body;
  
  if (setup_key !== process.env.SETUP_KEY) {
    return res.status(403).json({ error: 'Unauthorized. Invalid setup key.' });
  }

  if (!email || !password || !name || !username) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Admin already initialized.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      name,
      username,
      role: 'admin',
      contributions: 1000,
      skills: ['Administrator'],
      onboarded: true
    });

    res.status(201).json({ 
       success: true, 
       message: 'Admin account created successfully.',
       user: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role }
    });
  } catch (error) {
     console.error('[AUTH_ERROR] Setup Failure:', error.message);
     res.status(500).json({ error: 'Critical failure during setup. Please check logs.' });
  }
});

// 5. Logout
router.get('/logout', (req, res) => {
  res.clearCookie('nxg_auth', { path: '/' });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;

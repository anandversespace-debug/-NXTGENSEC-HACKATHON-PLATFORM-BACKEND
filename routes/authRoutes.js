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

<<<<<<< HEAD
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      onboarded: user.onboarded,
      bio: user.bio,
      location: user.location,
      github: user.github,
      twitter: user.twitter,
      portfolio: user.portfolio,
      skills: user.skills,
      contributions: user.contributions,
      isVerified: user.isVerified
    };

=======
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    res.cookie('nxg_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

<<<<<<< HEAD
    res.cookie('nxg_user_data', JSON.stringify(userData), {
      httpOnly: false, // Accessible to frontend
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token,
      user: userData
=======
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
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
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
<<<<<<< HEAD
    const verificationToken = Math.random().toString(36).substring(2, 12); // Simple token
=======
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      username,
<<<<<<< HEAD
      verificationToken,
      role: role || 'developer',
      contributions: 0,
      skills: [],
      onboarded: false,
      isVerified: false
=======
      role: role || 'developer',
      contributions: 0,
      skills: [],
      onboarded: false
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    });

    const { getVerificationTemplate } = require('../utils/emailTemplates');
    const { sendEmail } = require('../config/nodemailer');
<<<<<<< HEAD
    const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
=======
    const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?email=${encodeURIComponent(email)}`;
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    
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

<<<<<<< HEAD
// 2.1 Email Verification
router.get('/verify', async (req, res) => {
   const { token, email } = req.query;
   if (!token || !email) return res.status(400).json({ error: 'Invalid verification link.' });

   try {
      const user = await User.findOneAndUpdate(
        { email, verificationToken: token },
        { isVerified: true, verificationToken: '' },
        { new: true }
      );

      if (!user) return res.status(404).json({ error: 'Invalid or expired verification token.' });

      res.json({ success: true, message: 'Account verified successfully. You can now login.' });
   } catch (error) {
     res.status(500).json({ error: 'Verification failed.' });
   }
});

// 2.2 OAuth Mock (Google)
router.get('/google', async (req, res) => {
   // Simulated OAuth response
   res.json({ 
      success: true, 
      message: 'Redirecting to Google OAuth...',
      redirect: 'https://accounts.google.com/o/oauth2/auth...' 
   });
});

// 2.3 OAuth Mock (GitHub)
router.get('/github', async (req, res) => {
   res.json({ 
      success: true, 
      message: 'Redirecting to GitHub OAuth...',
      redirect: 'https://github.com/login/oauth/authorize...' 
   });
});

=======
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
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
<<<<<<< HEAD
      onboarded: true,
      isVerified: true
    });

    const adminData = {
      id: newAdmin._id,
      email: newAdmin.email,
      name: newAdmin.name,
      username: newAdmin.username,
      role: newAdmin.role,
      onboarded: newAdmin.onboarded,
      isVerified: newAdmin.isVerified
    };

    res.cookie('nxg_user_data', JSON.stringify(adminData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
=======
      onboarded: true
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    });

    res.status(201).json({ 
       success: true, 
       message: 'Admin account created successfully.',
<<<<<<< HEAD
       user: adminData
=======
       user: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role }
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    });
  } catch (error) {
     console.error('[AUTH_ERROR] Setup Failure:', error.message);
     res.status(500).json({ error: 'Critical failure during setup. Please check logs.' });
  }
});

// 5. Logout
router.get('/logout', (req, res) => {
  res.clearCookie('nxg_auth', { path: '/' });
<<<<<<< HEAD
  res.clearCookie('nxg_user_data', { path: '/' });
=======
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;

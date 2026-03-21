const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { OAuth2Client } = require('google-auth-library');
/** @type {any} */
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'nxg_secret_fallback_2026';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper: Sanitize User for Response & Cookies
 */
const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id, // Support both formats
  email: user.email,
  name: user.name,
  username: user.username,
  role: user.role,
  onboarded: user.onboarded,
  isVerified: user.isVerified || user.verificationToken === '',
  picture: user.picture || user.profile_image,
  bio: user.bio,
  location: user.location,
  skills: user.skills,
  contributions: user.contributions
});

/**
 * Centralized Session Finalizer
 * Handles JWT signing, cookie setting, and sanitized JSON response dispatch.
 */
const sendTokenResponse = (user, statusCode, res, redirect = false) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.anandverse.space' : undefined, // Shared across .anandverse.space
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    path: '/'
  };

  // 1. Secure auth cookie (HttpOnly)
  res.cookie('nxg_auth', token, cookieOptions);

  // 2. Client-side hydration cookie (Not HttpOnly)
  res.cookie('nxg_user_data', JSON.stringify(sanitizeUser(user)), {
    ...cookieOptions,
    httpOnly: false
  });

  if (redirect) {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } else {
    res.status(statusCode).json({ success: true, token, user: sanitizeUser(user) });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.password && user.provider !== 'local') {
      return res.status(401).json({ 
        error: `Account managed by ${user.provider}. Use social sign-in.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    // Multi-Layer Security Check
    if (user.twoFactorEnabled) {
      return res.status(200).json({ 
        success: true, 
        requires2fa: true, 
        userId: user._id,
        email: user.email 
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[AUTH_ERROR] Login Failure:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { email, password, name, username, role } = req.body;
  if (!email || !password || !name || !username) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'Email or username already taken.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = Math.random().toString(36).substring(2, 12); 

    await User.create({
      email,
      password: hashedPassword,
      name,
      username,
      verificationToken,
      role: role || 'developer',
      provider: 'local'
    });

    const { getVerificationTemplate } = require('../utils/emailTemplates');
    const { sendEmail } = require('../config/nodemailer');
    const actionLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    sendEmail(email, 'Verify Your Account - NxtGenSec', getVerificationTemplate(actionLink, name))
      .catch(err => console.error('[MAIL_ERROR] Verification email failed:', err));

    res.status(201).json({ 
       success: true, 
       message: 'Account created successfully. Please check your email for verification.' 
    });
  } catch (error) {
    console.error('[AUTH_ERROR] Registration Failure:', error);
    res.status(500).json({ error: 'Failed to create account.' });
  }
};

/**
 * @desc    Verify Email
 */
exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await User.findOneAndUpdate(
      { email, verificationToken: token },
      { isVerified: true, verificationToken: '' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Invalid or expired verification token.' });
    
    // Auto-login after verification for better UX
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed.' });
  }
};

/**
 * @desc    Google OAuth
 */
exports.googleAuth = async (req, res) => {
  const { token: idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Token is required.' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub: googleId, email, name, picture, email_verified } = ticket.getPayload();

    if (!email_verified) return res.status(400).json({ error: 'Google email not verified.' });

    let user = await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      if (user.provider === 'local') user.provider = 'google';
      user.isVerified = true;
      if (!user.picture) user.picture = picture;
      await user.save();
    } else {
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let count = 1;
      while (await User.findOne({ username })) username = `${baseUsername}${count++}`;

      user = await User.create({
        name,
        email,
        username,
        googleId,
        picture,
        provider: 'google',
        isVerified: true,
        onboarded: false
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[GOOGLE_OAUTH_ERROR]', error);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
};

/**
 * @desc    GitHub OAuth Logic (Handled via redirects)
 */
exports.githubAuth = (req, res) => {
  const redirectUri = `${process.env.BACKEND_URL}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
  res.json({ success: true, redirect: url });
};

/**
 * @desc    GitHub OAuth Callback
 */
exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);

  try {
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error('Failed to obtain GitHub access token.');

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const emailsRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const primaryEmail = emailsRes.data.find(e => e.primary && e.verified)?.email || emailsRes.data[0].email;

    let user = await User.findOne({ email: primaryEmail });

    if (user) {
      user.githubId = userRes.data.id.toString();
      if (user.provider === 'local') user.provider = 'github';
      user.isVerified = true;
      if (!user.picture) user.picture = userRes.data.avatar_url;
      await user.save();
    } else {
      const baseLogin = userRes.data.login;
      let username = baseLogin;
      let count = 1;
      while (await User.findOne({ username })) username = `${baseLogin}${count++}`;

      user = await User.create({
        name: userRes.data.name || baseLogin,
        email: primaryEmail,
        username,
        githubId: userRes.data.id.toString(),
        picture: userRes.data.avatar_url,
        provider: 'github',
        isVerified: true,
        onboarded: false
      });
    }

    sendTokenResponse(user, 200, res, true);
  } catch (error) {
    console.error('[GITHUB_OAUTH_ERROR]', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=github_failure`);
  }
};

/**
 * @desc    System Emergency Setup
 *          Creates initial organizer node if none exist in the registry.
 */
exports.emergencySetup = async (req, res) => {
  try {
     const count = await User.countDocuments({ role: { $in: ['admin', 'organizer'] } });
     if (count > 0) {
       return res.status(403).json({ error: 'System has already been initialized.' });
     }

     const { email, password, name, username, key } = req.body;
     
     // Simple key check to avoid bot abuse if accidentally exposed
     if (key !== (process.env.SETUP_KEY || 'cyber_setup_2026')) {
       return res.status(403).json({ error: 'Invalid master initialization key.' });
     }

     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);

     const user = await User.create({
       email,
       password: hashedPassword,
       name,
       username,
       role: 'organizer',
       isVerified: true,
       provider: 'local',
       onboarded: true
     });

     sendTokenResponse(user, 201, res);
  } catch (error) {
     res.status(500).json({ error: 'Initialization failure.' });
  }
};

/**
 * @desc    Logout
 */
exports.logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.anandverse.space' : undefined,
    path: '/'
  };
  res.clearCookie('nxg_auth', cookieOptions);
  res.clearCookie('nxg_user_data', { ...cookieOptions, httpOnly: false });
  res.status(200).json({ success: true, message: 'Identity purged from cache.' });
};

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models');
const { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} = require('@simplewebauthn/server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nxg_secret_fallback_2026';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * 2FA (TOTP) Setup
 */
exports.setupTOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `NxtGenSec (${user.email})` });
    
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate TOTP secret' });
  }
};

/**
 * 2FA (TOTP) Verify & Enable
 */
exports.verifyTOTP = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) return res.status(400).json({ error: 'TOTP not setup' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

/**
 * 2FA (TOTP) Login Verify
 */
exports.loginVerifyTOTP = async (req, res) => {
  const { token, userId } = req.body;
  try {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) return res.status(400).json({ error: 'Invalid request' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      const authToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role, username: user.username },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      res.json({ success: true, token: authToken, user: user });
    } else {
      res.status(400).json({ error: 'Invalid TOTP code' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login verification failed' });
  }
};

/**
 * Passkey (WebAuthn) Registration Start
 */
exports.registerPasskeyStart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const options = await generateRegistrationOptions({
      rpName: 'NxtGenSec Platform',
      rpID: RP_ID,
      userID: new Uint8Array(Buffer.from(user._id.toString())),
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start passkey registration' });
  }
};

/**
 * Passkey (WebAuthn) Registration Finish
 */
exports.registerPasskeyFinish = async (req, res) => {
  const { body } = req;
  try {
    const user = await User.findById(req.user.id).select('+currentChallenge');
    
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification;
      const { credential } = registrationInfo;
      
      user.passkeys.push({
        credentialID: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
        deviceType: registrationInfo.credentialDeviceType || 'unknown',
        transports: body.response.transports || [],
      });
      
      user.currentChallenge = undefined;
      await user.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Verification failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration finish failed' });
  }
};

/**
 * Passkey (WebAuthn) Login Start
 */
exports.loginPasskeyStart = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.passkeys || user.passkeys.length === 0) {
      return res.status(404).json({ error: 'No passkeys found for this user' });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      // @ts-ignore
      allowCredentials: user.passkeys.map(p => ({
        id: p.credentialID,
        transports: p.transports,
      })),
      userVerification: 'preferred',
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start passkey login' });
  }
};

/**
 * Passkey (WebAuthn) Login Finish
 */
exports.loginPasskeyFinish = async (req, res) => {
  const { body, email } = req.body;
  try {
    const user = await User.findOne({ email }).select('+currentChallenge');
    const passkey = user.passkeys.find(p => p.credentialID === body.id);

    if (!passkey) return res.status(400).json({ error: 'Credential not recognized' });

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credentialID,
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')),
        counter: passkey.counter,
        // @ts-ignore
        transports: passkey.transports,
      },
    });

    if (verification.verified) {
      passkey.counter = verification.authenticationInfo.newCounter;
      user.currentChallenge = undefined;
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, username: user.username },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.json({ success: true, token, user: user });
    } else {
      res.status(400).json({ error: 'Authentication failed' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login finish failed' });
  }
};

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Authentication Protocol Routes
 */

// Local Auth
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verify', authController.verifyEmail);
router.get('/logout', authController.logout);

// OAuth - Google
router.post('/google', authController.googleAuth);

const advancedAuthController = require('../controllers/advancedAuthController');
const { authMiddleware } = require('../middleware/auth');

// TOTP (2FA) Protocol
router.get('/2fa/setup', authMiddleware, advancedAuthController.setupTOTP);
router.post('/2fa/verify', authMiddleware, advancedAuthController.verifyTOTP);
router.post('/2fa/login', advancedAuthController.loginVerifyTOTP);

// Passkeys (WebAuthn) Protocol
router.post('/passkey/register/start', authMiddleware, advancedAuthController.registerPasskeyStart);
router.post('/passkey/register/finish', authMiddleware, advancedAuthController.registerPasskeyFinish);
router.post('/passkey/login/start', advancedAuthController.loginPasskeyStart);
router.post('/passkey/login/finish', advancedAuthController.loginPasskeyFinish);

module.exports = router;

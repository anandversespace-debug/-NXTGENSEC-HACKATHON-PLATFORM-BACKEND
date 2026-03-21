const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  role: { 
    type: String, 
    enum: ['admin', 'organizer', 'developer', 'viewer', 'judge'], 
    default: 'developer' 
  },
  bio: { type: String, default: '' },
  location: { type: String, default: 'Distributed' },
  github: { type: String, default: '' },
  twitter: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  skills: [{ type: String }],
  contributions: { type: Number, default: 0 },
  onboarded: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  
  // OAuth Fields
  picture: { type: String, default: '' },
  provider: { type: String, default: 'local' }, // 'local', 'google', 'github', 'google+github'
  googleId: { type: String, sparse: true },
  githubId: { type: String, sparse: true },

  // Preferences
  newsletterSubscribed: { type: Boolean, default: false },
  notifications: {
    security: { type: Boolean, default: true },
    hackathons: { type: Boolean, default: true },
    recommendations: { type: Boolean, default: true }
  },

  // Advanced Security
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  passkeys: [{
    credentialID: String,
    publicKey: String,
    counter: Number,
    deviceType: String,
    transports: [String]
  }],
  currentChallenge: { type: String, select: false } // For WebAuthn session
}, { timestamps: true });

// Text index for search functionality
userSchema.index({ name: 'text', username: 'text' });

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

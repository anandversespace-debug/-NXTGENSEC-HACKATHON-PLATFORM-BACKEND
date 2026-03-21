const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'judge', 'developer', 'viewer'], 
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

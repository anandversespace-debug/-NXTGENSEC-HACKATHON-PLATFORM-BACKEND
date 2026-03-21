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
<<<<<<< HEAD
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
=======
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

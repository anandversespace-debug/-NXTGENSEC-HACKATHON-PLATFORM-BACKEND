const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // 'VERIFIED_PROJECT', 'REJECTED_PROJECT', 'USER_PROMOTED', etc.
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  target_type: { type: String, enum: ['Project', 'User', 'Hackathon'], required: true },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

logSchema.index({ admin_id: 1, action: 1 });
logSchema.index({ createdAt: -1 });
logSchema.index({ target_id: 1 });

module.exports = mongoose.model('Log', logSchema);

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hackathon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  team_name: { type: String, required: true },
  registered_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);

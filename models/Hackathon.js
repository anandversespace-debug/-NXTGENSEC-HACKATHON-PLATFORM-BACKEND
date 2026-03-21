const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  prize_pool: { type: String, default: 'Negotiable' },
  registration_link: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'live', 'completed'], default: 'draft' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
}, { timestamps: true });

module.exports = mongoose.model('Hackathon', hackathonSchema);

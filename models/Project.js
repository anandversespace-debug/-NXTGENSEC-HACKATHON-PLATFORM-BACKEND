const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tech_stack: [{ type: String }],
  github_url: { type: String, default: '' },
  demo_url: { type: String, default: '' },
  image: { type: String, default: '' },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  hackathon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon'
  },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'auditing', 'verified'], default: 'pending' },
  stars: { type: Number, default: 0 },
  starred_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

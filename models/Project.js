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

// Text index for search functionality
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  tech_stack: 'text' 
});

projectSchema.index({ status: 1 });
projectSchema.index({ created_by: 1 });
projectSchema.index({ hackathon_id: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);

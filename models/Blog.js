const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  category: { type: String, default: 'Security' },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);

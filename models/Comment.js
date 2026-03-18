const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  blog_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);

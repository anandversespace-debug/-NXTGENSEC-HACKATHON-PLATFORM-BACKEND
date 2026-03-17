const { blogs } = require('../models/index.js');

let comments = [];

const getAllBlogs = async (req, res) => {
  res.json(blogs);
};

const getBlogById = async (req, res) => {
  const blog = blogs.find(b => b.id === req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  const blogComments = comments.filter(c => c.blog_id === req.params.id);
  res.json({ ...blog, comments: blogComments });
};

const createBlog = async (req, res) => {
  const newBlog = { id: Date.now().toString(), ...req.body, created_at: new Date() };
  blogs.push(newBlog);
  res.status(201).json(newBlog);
};

const addComment = async (req, res) => {
  const { blog_id, user_id, user_name, content } = req.body;
  const newComment = { id: Date.now().toString(), blog_id, user_id, user_name, content, created_at: new Date() };
  comments.push(newComment);
  res.status(201).json(newComment);
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  addComment
};

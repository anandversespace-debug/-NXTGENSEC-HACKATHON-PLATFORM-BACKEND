const { Blog, Comment } = require('../models');

const getAllBlogs = async (req, res) => {
  try {
    const data = await Blog.find({}).populate('author', 'name username').sort({ createdAt: -1 }).lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to access blog repository.' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const data = await Blog.findById(req.params.id).populate('author', 'name username').lean();
    if (!data) return res.status(404).json({ message: 'Blog node not found in registry.' });
    
    // Fetch comments for this blog
    const comments = await Comment.find({ blog_id: req.params.id }).sort({ createdAt: -1 }).lean();
    
    res.json({ ...data, comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blog metadata.' });
  }
};

const createBlog = async (/** @type {any} */ req, res) => {
  try {
    const newBlog = await Blog.create({
      ...req.body,
      author: req.user.id
    });
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast new blog node.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { blog_id, user_id, user_name, content } = req.body;
    const newComment = await Comment.create({
      blog_id,
      user_id: user_id || req.user?.id,
      user_name: user_name || req.user?.username,
      content
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to inject comment into blog node.' });
  }
};

const updateBlog = async (/** @type {any} */ req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    // Authorization: Author or Admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this blog.' });
    }

    Object.assign(blog, req.body);
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog.' });
  }
};

const deleteBlog = async (/** @type {any} */ req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    // Authorization: Author or Admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this blog.' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog.' });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  addComment,
  updateBlog,
  deleteBlog
};

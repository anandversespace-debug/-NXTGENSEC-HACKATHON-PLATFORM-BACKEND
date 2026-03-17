const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', blogController.createBlog);
router.post('/comment', blogController.addComment);

module.exports = router;

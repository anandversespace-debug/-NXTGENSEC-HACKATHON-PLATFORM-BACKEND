const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authMiddleware, restrictTo } = require('../middleware/auth');

router.get('/metrics', authMiddleware, restrictTo('admin', 'organizer'), systemController.getSystemMetrics);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/leaderboard', userController.getLeaderboard);
router.get('/:username', userController.getProfileByUsername);
router.put('/:id', userController.updateProfile);

module.exports = router;

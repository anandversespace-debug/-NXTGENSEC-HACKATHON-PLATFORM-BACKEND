const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/profile', userController.getMyProfile);
router.get('/stats', userController.getDashboardStats);
router.get('/admin-stats', userController.getAdminStats);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:username', userController.getProfileByUsername);
router.put('/profile', userController.updateProfile);
router.put('/:id', userController.updateProfile);
router.delete('/:id', userController.deleteUser);

module.exports = router;

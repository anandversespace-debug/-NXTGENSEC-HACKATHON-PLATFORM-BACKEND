const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/profile', userController.getMyProfile);
router.get('/stats', userController.getDashboardStats);
router.get('/public-stats', userController.getPublicStats);
const { restrictTo } = require('../middleware/auth');
router.get('/admin-stats', restrictTo('admin'), userController.getAdminStats);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/profile/:username', userController.getProfileByUsername);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.put('/:id', userController.updateProfile);
router.delete('/:id', userController.deleteUser);

module.exports = router;

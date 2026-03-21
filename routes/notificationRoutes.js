const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { Notification } = require('../models');

// Get notifications for current user + global broadcasts
router.get('/', async (/** @type {any} */ req, res) => {
  try {
    const userId = req.user?.id;
    const data = await Notification.find({ 
      $or: [
        { userId: userId }, 
        { userId: { $exists: false } }, 
        { userId: null }
      ] 
    }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// Mark notification as read
router.post('/read', async (req, res) => {
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ success: true, message: 'Message updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message.' });
  }
});

// Broadcast notification (Admin only)
router.post('/broadcast', async (/** @type {any} */ req, res) => {
   if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Root privileges required.' });
   }
   try {
      const { getIO } = require('../config/socket');
      const data = await Notification.create(req.body);
      
      // Emit to all connected clients
      getIO().emit('new_broadcast', data);
      
      res.status(201).json(data);
   } catch (error) {
      res.status(500).json({ error: 'Failed to transmit broadcast.' });
   }
=======

router.get('/', (req, res) => {
  res.json({ message: 'Get notifications endpoint placeholder' });
});

router.post('/read', (req, res) => {
  res.json({ message: 'Mark notification read placeholder' });
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
});

module.exports = router;

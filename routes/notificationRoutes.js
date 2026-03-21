const express = require('express');
const router = express.Router();
const { Notification } = require('../models');

// Get notifications for current user + global broadcasts
router.get('/', async (/** @type {any} */ req, res) => {
  try {
    const userId = req.user?.id;
    // Return notifications specific to user or global broadcasts (userId null/missing)
    const data = await Notification.find({ 
      $or: [
        { userId: userId }, 
        { userId: { $exists: false } }, 
        { userId: null }
      ] 
    }).sort({ createdAt: -1 }).lean();
    res.json(data || []);
  } catch (error) {
    console.error('[NOTIF_ERROR] Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to access message registry.' });
  }
});

// Mark notification as read
router.post('/read', async (/** @type {any} */ req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) return res.status(400).json({ error: 'Notification identity required.' });

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ error: 'Message node not found.' });

    // Ensure user only marks their own private notifications as read
    // Global broadcasts (no userId) are not uniquely read by users in this schema
    if (notification.userId && notification.userId.toString() !== req.user?.id) {
       return res.status(403).json({ error: 'Unauthorized to modify this notification.' });
    }

    notification.isRead = true;
    await notification.save();
    
    res.json({ success: true, message: 'Message state synchronized.' });
  } catch (error) {
    console.error('[NOTIF_ERROR] Failed to update read state:', error);
    res.status(500).json({ error: 'Failed to update message registry.' });
  }
});

// Broadcast notification (Admin only)
router.post('/broadcast', async (/** @type {any} */ req, res) => {
   if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Root privileges required for global broadcast.' });
   }
   
   try {
      const { title, message, type } = req.body;
      if (!title || !message) return res.status(400).json({ error: 'Payload requires title and message.' });

      const data = await Notification.create({
        title,
        message,
        type: type || 'info',
        userId: null
      });

      res.status(201).json(data);
   } catch (error) {
      console.error('[NOTIF_ERROR] Broadcast transmit failed:', error);
      res.status(500).json({ error: 'Failed to transmit broadcast.' });
   }
});

module.exports = router;

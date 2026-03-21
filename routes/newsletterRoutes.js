const express = require('express');
const router = express.Router();
const { sendManualNewsletter } = require('../controllers/newsletterController');
const { authMiddleware, restrictTo } = require('../middleware/auth');

/**
 * @route   POST /api/newsletter/send
 * @desc    Broadcast weekly intelligence to all subscribers
 * @access  Private (Admin Only)
 */
router.post('/send', authMiddleware, restrictTo('admin'), sendManualNewsletter);

/**
 * @route   PATCH /api/newsletter/subscribe
 * @desc    Toggle current user's subscription status
 * @access  Private
 */
router.patch('/subscribe', authMiddleware, async (/** @type {any} */ req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    user.newsletterSubscribed = !user.newsletterSubscribed;
    await user.save();
    
    res.json({ 
      subscribed: user.newsletterSubscribed,
      message: user.newsletterSubscribed ? 'Newsletter protocols active.' : 'Newsletter protocols offline.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update subscription node.' });
  }
});

module.exports = router;

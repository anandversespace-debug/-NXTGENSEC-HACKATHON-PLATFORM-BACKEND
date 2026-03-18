const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get notifications endpoint placeholder' });
});

router.post('/read', (req, res) => {
  res.json({ message: 'Mark notification read placeholder' });
});

module.exports = router;

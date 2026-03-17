const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');

router.get('/', hackathonController.getAllHackathons);
router.get('/:id', hackathonController.getHackathonById);
router.post('/', hackathonController.createHackathon);
router.post('/register', hackathonController.registerForHackathon);

module.exports = router;

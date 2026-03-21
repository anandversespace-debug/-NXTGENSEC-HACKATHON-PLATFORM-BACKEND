const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');

router.get('/', hackathonController.getAllHackathons);
router.get('/my', hackathonController.getMyHackathons);
router.get('/:id', hackathonController.getHackathonById);
router.post('/', hackathonController.createHackathon);
router.put('/:id', hackathonController.updateHackathon);
router.delete('/:id', hackathonController.deleteHackathon);
router.post('/register', hackathonController.registerForHackathon);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getOverviewStats, 
  getAllRegistrations, 
  updateRegistration, 
  deleteRegistration, 
  getAllSubmissions,
  updateSubmission,
  deleteSubmission,
  getAllTeams,
  updateTeam 
} = require('../controllers/organizerController');
const { authMiddleware, restrictTo } = require('../middleware/auth');

// Middleware stack for all routes
router.use(authMiddleware);
router.use(restrictTo('organizer', 'admin', 'judge'));

// Stats
router.get('/stats/overview', getOverviewStats);

// Registrations / Participants
router.get('/registrations', getAllRegistrations);
router.put('/registrations/:id', updateRegistration);
router.delete('/registrations/:id', deleteRegistration);

// Teams
router.get('/teams', getAllTeams);
router.put('/teams', updateTeam);

// Submissions
router.get('/submissions', getAllSubmissions);
router.put('/submissions/:id', updateSubmission);
router.delete('/submissions/:id', deleteSubmission);

module.exports = router;

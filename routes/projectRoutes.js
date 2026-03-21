const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

const { restrictTo } = require('../middleware/auth');

router.get('/', projectController.getAllProjects);
router.get('/featured', projectController.getFeaturedProjects);
router.get('/my', projectController.getMyProjects);
router.get('/submissions', projectController.getSubmissions);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.post('/:id/star', projectController.toggleStar);
router.patch('/:id/status', restrictTo('admin', 'organizer'), projectController.updateProjectStatus);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;

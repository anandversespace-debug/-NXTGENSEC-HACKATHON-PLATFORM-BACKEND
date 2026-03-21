const { Project } = require('../models');

const getAllProjects = async (req, res) => {
  try {
    const data = await Project.find({}).populate('created_by', 'name username').lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

const getMyProjects = async (/** @type {any} */ req, res) => {
  try {
    const data = await Project.find({ created_by: req.user.id }).populate('created_by', 'name username').lean();
    res.json(data);
  } catch (error) {
    console.error('Fetch My Projects Error:', error);
    res.status(500).json({ error: 'Failed to fetch your projects.' });
  }
};

const getSubmissions = async (/** @type {any} */ req, res) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'organizer' 
      ? { hackathon_id: { $exists: true } }
      : { created_by: req.user.id, hackathon_id: { $exists: true } };

    const data = await Project.find(query)
      .populate('created_by', 'name username')
      .populate('hackathon_id', 'title')
      .lean();

    res.json(data);
  } catch (error) {
    console.error('Fetch Submissions Error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const data = await Project.findById(req.params.id).populate('created_by', 'name username').lean();
    if (!data) return res.status(404).json({ message: 'Project not found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details.' });
  }
};

const createProject = async (/** @type {any} */ req, res) => {
  try {
    const newProject = await Project.create({
      ...req.body,
      created_by: req.user.id
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error('[DB_ERROR] Project Creation Failure:', error);
    res.status(500).json({ error: 'Failed to create project.' });
  }
};

const updateProject = async (/** @type {any} */ req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Authorization: Owner or Admin
    if (project.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this project.' });
    }

    Object.assign(project, req.body);
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

const deleteProject = async (/** @type {any} */ req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Authorization: Owner or Admin
    if (project.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this project.' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

const toggleStar = async (/** @type {any} */ req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const userId = req.user.id;
    const alreadyStarred = project.starred_by.includes(userId);

    if (alreadyStarred) {
      project.starred_by = project.starred_by.filter(id => id.toString() !== userId);
      project.stars = Math.max(0, project.stars - 1);
    } else {
      project.starred_by.push(userId);
      project.stars += 1;
    }

    await project.save();
    res.json({ stars: project.stars, starred: !alreadyStarred });
  } catch (error) {
    console.error('[DB_ERROR] Star Toggle Failure:', error);
    res.status(500).json({ error: 'Failed to update project star status.' });
  }
};

const getFeaturedProjects = async (req, res) => {
  try {
    const data = await Project.find({})
      .sort({ stars: -1, createdAt: -1 })
      .limit(3)
      .populate('created_by', 'name username');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured projects.' });
  }
};

const getProjectBySlug = async (req, res) => {
  try {
    const data = await Project.findById(req.params.slug).populate('created_by', 'name username');
    if (!data) return res.status(404).json({ message: 'Project not found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details.' });
  }
};

const updateProjectStatus = async (/** @type {any} */ req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'auditing', 'verified'].includes(status)) {
       return res.status(400).json({ error: 'Invalid operation status.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project node not found.' });

    const oldStatus = project.status;
    project.status = status;
    await project.save();

    // Reward logic: +100 Rep points if newly verified
    if (status === 'verified' && oldStatus !== 'verified') {
       const { User } = require('../models');
       await User.findByIdAndUpdate(project.created_by, { $inc: { contributions: 100 } });
       
       // Real-time signal
       try {
         const { getIO } = require('../config/socket');
         const io = getIO();
         io.to(`user_${project.created_by}`).emit('project_status_change', {
           projectId: project._id,
           title: project.title,
           status: 'verified',
           pointsReward: 100
         });
       } catch (err) {
         console.warn('[REALTIME_WARN] Failed to transmit project signal:', err.message);
       }
    }

    // Audit Trail Logging
    try {
      const { Log } = require('../models');
      await Log.create({
        admin_id: req.user.id,
        action: `PROJECT_${status.toUpperCase()}`,
        target_id: project._id,
        target_type: 'Project',
        details: { oldStatus, newStatus: status }
      });
    } catch (err) {
      console.warn('[AUDIT_WARN] Failed to record audit log:', err.message);
    }

    res.json({ message: `Project status rotated to ${status}`, status });
  } catch (error) {
    console.error('[DB_ERROR] Status Rotation Failure:', error);
    res.status(500).json({ error: 'System failed to rotate project status.' });
  }
};

module.exports = {
  getAllProjects,
  getMyProjects,
  getSubmissions,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleStar,
  getFeaturedProjects,
  getProjectBySlug,
  updateProjectStatus
};

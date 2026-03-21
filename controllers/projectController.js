const { Project } = require('../models');

const getAllProjects = async (req, res) => {
  try {
<<<<<<< HEAD
    const data = await Project.find({}).populate('created_by', 'name username').lean();
=======
    const data = await Project.find({}).populate('created_by', 'name username');
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

const getMyProjects = async (req, res) => {
  try {
<<<<<<< HEAD
    const data = await Project.find({ created_by: req.user.id }).populate('created_by', 'name username').lean();
=======
    const data = await Project.find({ created_by: req.user.id }).populate('created_by', 'name username');
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    res.json(data);
  } catch (error) {
    console.error('Fetch My Projects Error:', error);
    res.status(500).json({ error: 'Failed to fetch your projects.' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'judge' 
      ? { hackathon_id: { $exists: true } }
      : { created_by: req.user.id, hackathon_id: { $exists: true } };

    const data = await Project.find(query)
      .populate('created_by', 'name username')
<<<<<<< HEAD
      .populate('hackathon_id', 'title')
      .lean();
=======
      .populate('hackathon_id', 'title');
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57

    res.json(data);
  } catch (error) {
    console.error('Fetch Submissions Error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
};

const getProjectById = async (req, res) => {
  try {
<<<<<<< HEAD
    const data = await Project.findById(req.params.id).populate('created_by', 'name username').lean();
=======
    const data = await Project.findById(req.params.id).populate('created_by', 'name username');
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    if (!data) return res.status(404).json({ message: 'Project not found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details.' });
  }
};

const createProject = async (req, res) => {
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

const updateProject = async (req, res) => {
  try {
<<<<<<< HEAD
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Authorization: Owner or Admin
    if (project.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this project.' });
    }

    Object.assign(project, req.body);
    await project.save();
    
    res.json(project);
=======
    const data = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!data) return res.status(404).json({ message: 'Project not found.' });
    res.json(data);
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

const deleteProject = async (req, res) => {
  try {
<<<<<<< HEAD
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Authorization: Owner or Admin
    if (project.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this project.' });
    }

    await Project.findByIdAndDelete(req.params.id);
=======
    const data = await Project.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ message: 'Project not found.' });
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

const toggleStar = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const userId = req.user.id;
    const alreadyStarred = project.starred_by.includes(userId);

    if (alreadyStarred) {
<<<<<<< HEAD
      project.starred_by = project.starred_by.filter(id => id.toString() !== userId);
=======
      project.starred_by.pull(userId);
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
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
    // We'll treat ID as slug for now, or match slug field if it exists
    const data = await Project.findById(req.params.slug).populate('created_by', 'name username');
    if (!data) return res.status(404).json({ message: 'Project not found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details.' });
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
  getProjectBySlug
};

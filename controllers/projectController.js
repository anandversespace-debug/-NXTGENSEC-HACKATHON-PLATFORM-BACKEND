const { projects } = require('../models/index.js');

const getAllProjects = async (req, res) => {
  try {
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const newProject = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date()
    };
    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const index = projects.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Project not found' });
    
    projects[index] = { ...projects[index], ...req.body };
    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    projects = projects.filter(p => p.id !== req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};

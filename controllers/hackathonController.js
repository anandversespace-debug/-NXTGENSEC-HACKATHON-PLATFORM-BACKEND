const { hackathons } = require('../models/index.js');

let registrations = [];

const getAllHackathons = async (req, res) => {
  res.json(hackathons);
};

const getHackathonById = async (req, res) => {
  const hack = hackathons.find(h => h.id === req.params.id);
  if (!hack) return res.status(404).json({ message: 'Hackathon not found' });
  res.json(hack);
};

const createHackathon = async (req, res) => {
  const newHack = { id: Date.now().toString(), ...req.body };
  hackathons.push(newHack);
  res.status(201).json(newHack);
};

const registerForHackathon = async (req, res) => {
  const { user_id, hackathon_id, team_name } = req.body;
  const reg = { id: Date.now().toString(), user_id, hackathon_id, team_name, registered_at: new Date() };
  registrations.push(reg);
  res.status(201).json(reg);
};

module.exports = {
  getAllHackathons,
  getHackathonById,
  createHackathon,
  registerForHackathon
};

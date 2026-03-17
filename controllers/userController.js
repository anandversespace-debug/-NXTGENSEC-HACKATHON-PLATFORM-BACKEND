const { users } = require('../models/index.js');

const getLeaderboard = async (req, res) => {
  const sorted = [...users].sort((a, b) => b.contributions - a.contributions);
  res.json(sorted);
};

const getProfileByUsername = async (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const updateProfile = async (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
};

module.exports = {
  getLeaderboard,
  getProfileByUsername,
  updateProfile
};

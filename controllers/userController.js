const { User } = require('../models');

const getLeaderboard = async (req, res) => {
  try {
    const data = await User.find({})
      .sort({ contributions: -1 })
      .select('-password');

    res.json(data);
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'System failed to fetch the reputation matrix.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { Project, Registration } = require('../models');
    
    const [projectCount, eventCount, user] = await Promise.all([
      Project.countDocuments({ created_by: req.user.id }),
      Registration.countDocuments({ user_id: req.user.id }),
      User.findById(req.user.id).select('contributions')
    ]);

    res.json({
      activeProjects: projectCount,
      eventsJoined: eventCount,
      totalPoints: user?.contributions || 0
    });
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'System failed to fetch operational telemetry.' });
  }
};

const getProfileByUsername = async (req, res) => {
  try {
    const data = await User.findOne({ username: req.params.username })
      .select('-password');

    if (!data) return res.status(404).json({ message: 'User not found in registry.' });
    
    res.json(data);
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch user profile:', error);
    res.status(500).json({ error: 'System failed to identify this user node.' });
  }
};

const updateProfile = async (req, res) => {
  try {
     const data = await User.findByIdAndUpdate(
       req.params.id || req.user.id,
       req.body,
       { new: true }
     ).select('-password');

     if (!data) return res.status(404).json({ error: 'Identity not found.' });
     res.json(data);
  } catch (error) {
     console.error('[DB_ERROR] Failed to update user profile:', error);
     res.status(500).json({ error: 'System failed to rotate cryptographic metadata.' });
  }
};

const getUsers = async (req, res) => {
  try {
     const data = await User.find({})
       .sort({ createdAt: -1 })
       .select('-password');

     res.json(data);
  } catch (error) {
     console.error('[DB_ERROR] Failed to fetch users:', error);
     res.status(500).json({ error: 'System failed to fetch node registry.' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const data = await User.findById(req.user.id).select('-password');

    if (!data) return res.status(404).json({ error: 'Identity not found.' });
    res.json(data);
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch session profile:', error);
    res.status(500).json({ error: 'System failed to identify session node.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const data = await User.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Identity not found.' });
    res.json({ message: 'User entity purged from registry.' });
  } catch (error) {
    console.error('[DB_ERROR] Failed to delete user:', error);
    res.status(500).json({ error: 'System failed to purge user node.' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { Project, Hackathon, Registration } = require('../models');
    
    const [totalUsers, totalProjects, activeHackathons, pendingSubmissions] = await Promise.all([
      User.countDocuments({}),
      Project.countDocuments({}),
      Hackathon.countDocuments({ end_date: { $gte: new Date() } }),
      Project.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalUsers,
      totalProjects,
      activeHackathons,
      pendingSubmissions
    });
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch admin stats:', error);
    res.status(500).json({ error: 'System failed to fetch admin telemetry.' });
  }
};

module.exports = {
  getUsers,
  getMyProfile,
  getLeaderboard,
  getDashboardStats,
  getAdminStats,
  getProfileByUsername,
  updateProfile,
  deleteUser
};

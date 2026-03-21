const { User } = require('../models');

const getLeaderboard = async (req, res) => {
  try {
    const data = await User.find({})
      .sort({ contributions: -1 })
      .select('-password')
      .lean();

    res.json(data);
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'System failed to fetch the reputation matrix.' });
  }
};

const getDashboardStats = async (/** @type {any} */ req, res) => {
  try {
    const { Project, Registration } = require('../models');
    // Handle both id and _id from JWT for resilience
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
       return res.status(401).json({ error: 'System could not verify your identity node.' });
    }
    
    const [projectCount, eventCount, user] = await Promise.all([
      Project.countDocuments({ created_by: userId }),
      Registration.countDocuments({ user_id: userId }),
      User.findById(userId).select('contributions').lean()
    ]);

    res.json({
      activeProjects: projectCount || 0,
      eventsJoined: eventCount || 0,
      totalPoints: user?.contributions || 0
    });
  } catch (error) {
    console.error('[DB_ERROR] Telemetry Fetch Failed:', error);
    res.status(500).json({ error: 'System failed to fetch operational telemetry.' });
  }
};

const getProfileByUsername = async (req, res) => {
  try {
    const data = await User.findOne({ username: req.params.username })
      .select('-password')
      .lean();

    if (!data) return res.status(404).json({ message: 'User not found in registry.' });
    
    res.json(data);
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch user profile:', error);
    res.status(500).json({ error: 'System failed to identify this user node.' });
  }
};

const updateProfile = async (/** @type {any} */ req, res) => {
  try {
     const targetId = req.params.id || req.user.id;

     // Authorization: Self or Admin
     if (targetId !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Unauthorized to update this profile.' });
     }

     const data = await User.findByIdAndUpdate(
       targetId,
       req.body,
       { new: true }
     ).select('-password').lean();

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
       .select('-password')
       .lean();

     res.json(data);
  } catch (error) {
     console.error('[DB_ERROR] Failed to fetch users:', error);
     res.status(500).json({ error: 'System failed to fetch node registry.' });
  }
};

const getMyProfile = async (/** @type {any} */ req, res) => {
  try {
    const data = await User.findById(req.user.id).select('-password').lean();

    if (!data) return res.status(404).json({ error: 'Identity not found.' });
    res.json(data);
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch session profile:', error);
    res.status(500).json({ error: 'System failed to identify session node.' });
  }
};

const deleteUser = async (/** @type {any} */ req, res) => {
  try {
    // Authorization: Admin only for deletion of other users
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this user.' });
    }

    const data = await User.findByIdAndDelete(req.params.id || req.user.id);
    if (!data) return res.status(404).json({ error: 'Identity not found.' });
    res.json({ message: 'User entity purged from registry.' });
  } catch (error) {
    console.error('[DB_ERROR] Failed to delete user:', error);
    res.status(500).json({ error: 'System failed to purge user node.' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { Project, Hackathon } = require('../models');
    
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

const getPublicStats = async (req, res) => {
  try {
    const { Project, Hackathon } = require('../models');
    
    const [totalUsers, totalProjects, activeHackathons] = await Promise.all([
      User.countDocuments({}),
      Project.countDocuments({ status: 'verified' }),
      Hackathon.countDocuments({ end_date: { $gte: new Date() } })
    ]);

    res.json({
      totalUsers,
      totalProjects,
      activeHackathons
    });
  } catch (error) {
    console.error('[DB_ERROR] Failed to fetch public stats:', error);
    res.status(500).json({ error: 'System failed to fetch public telemetry.' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required.' });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: 'Identity node not found.' });

    if (!user.password) {
      return res.status(400).json({ error: 'This account uses social authentication. Set a password via recovery if needed.' });
    }

    const isMatch = await require('bcryptjs').compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Current password verification failed.' });

    const salt = await require('bcryptjs').genSalt(10);
    user.password = await require('bcryptjs').hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Cryptographic credentials rotated.' });
  } catch (err) {
    console.error('[AUTH_ERROR] Password Rotate Failure:', err);
    res.status(500).json({ error: 'System failure during credential rotation.' });
  }
};

module.exports = {
  getUsers,
  getMyProfile,
  getLeaderboard,
  getDashboardStats,
  getAdminStats,
  getPublicStats,
  getProfileByUsername,
  updateProfile,
  deleteUser,
  changePassword
};

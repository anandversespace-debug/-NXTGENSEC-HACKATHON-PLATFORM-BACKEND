const { User, Project, Log } = require('../models');

const getSystemMetrics = async (req, res) => {
  try {
    // 1. User Distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 2. Project Activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const projectTimeline = await Project.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Verification Activity
    const auditStats = await Log.aggregate([
      { $match: { action: { $in: ['PROJECT_VERIFIED', 'PROJECT_AUDITING'] } } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    res.json({
      roles: userRoles,
      timeline: projectTimeline,
      audits: auditStats
    });
  } catch (error) {
    console.error('[METRICS_ERROR] Statistics build failure:', error);
    res.status(500).json({ error: 'Failed to build system metrics.' });
  }
};

module.exports = { getSystemMetrics };

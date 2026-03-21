const { User, Project, Hackathon, Registration } = require('../models');

/**
 * @desc Get dashboard metrics for organizers
 */
exports.getOverviewStats = async (req, res) => {
  try {
    const [totalRegistrations, totalHackathons, totalSubmissions, activeUsers] = await Promise.all([
      Registration.countDocuments(),
      Hackathon.countDocuments(),
      Project.countDocuments({ status: 'verified' }),
      User.countDocuments({ role: 'developer' })
    ]);

    const revenue = totalRegistrations * 25;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timeline = await Registration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%a", date: "$createdAt" } },
          value: { $sum: 1 }
        }
      }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedTimeline = days.map(day => {
      const match = timeline.find(t => t._id === day);
      return { name: day, value: match ? match.value : 0 };
    });

    const [recentRegs, recentSubmissions] = await Promise.all([
      Registration.find().sort({ createdAt: -1 }).limit(3).populate('user_id', 'username'),
      Project.find().sort({ createdAt: -1 }).limit(2).populate('created_by', 'username')
    ]);

    const recentActions = [
      ...recentRegs.map(r => ({
        id: `reg-${r._id}`,
        type: 'registration',
        user: r.user_id?.['username'] || 'unknown',
        time: 'Recieved',
        status: r.status || 'pending'
      })),
      ...recentSubmissions.map(p => ({
        id: `sub-${p._id}`,
        type: 'submission',
        user: p.created_by?.['username'] || 'unknown',
        time: 'Verified',
        status: p.status
      }))
    ].slice(0, 5);

    res.json({
      registrations: totalRegistrations,
      teams: Math.ceil(totalRegistrations / 3),
      submissions: totalSubmissions,
      revenue: revenue,
      activeUsers: activeUsers,
      timeline: formattedTimeline,
      recentActions: recentActions,
      activeHackathons: totalHackathons
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve system stats.' });
  }
};

/**
 * @desc Get all registrations
 */
exports.getAllRegistrations = async (req, res) => {
  try {
    const data = await Registration.find()
      .populate('user_id', 'name username email')
      .populate('hackathon_id', 'title')
      .sort({ createdAt: -1 });

    const formatted = data.map(r => ({
      id: r._id,
      name: r.user_id?.['name'] || 'Unknown',
      username: r.user_id?.['username'] || 'unknown',
      email: r.user_id?.['email'] || 'N/A',
      status: r.status || 'pending',
      time: r.createdAt,
      team: r.team_name,
      hackathon: r.hackathon_id?.['title'] || 'N/A'
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch node registry.' });
  }
};

/**
 * @desc Update registration status
 */
exports.updateRegistration = async (req, res) => {
  try {
    const data = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ message: 'Entry not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update protocol node.' });
  }
};

/**
 * @desc Delete registration
 */
exports.deleteRegistration = async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Protocol entry purged.' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failure.' });
  }
};

/**
 * @desc Get all teams (grouped registrations)
 */
exports.getAllTeams = async (req, res) => {
  try {
    const data = await Registration.find()
      .populate('user_id', 'username')
      .populate('hackathon_id', 'title');

    // Group by team_name manually to include status (if consistent)
    const teamsMap = new Map();
    data.forEach(r => {
      const key = `${r.team_name}-${r.hackathon_id?.['_id'] || r.hackathon_id}`;
      if (!teamsMap.has(key)) {
        teamsMap.set(key, {
          id: r._id,
          name: r.team_name,
          leader: r.user_id?.['username'] || 'unknown',
          membersCount: 0,
          hackathon: r.hackathon_id?.['title'] || 'N/A',
          status: r.status === 'approved' ? 'verified' : r.status === 'rejected' ? 'disqualified' : 'pending',
          submissions: 0
        });
      }
      teamsMap.get(key).membersCount += 1;
    });

    res.json(Array.from(teamsMap.values()));
  } catch (err) {
    res.status(500).json({ error: 'Team node scan failed.' });
  }
};

/**
 * @desc Update team status (Bulk updates registrations)
 */
exports.updateTeam = async (req, res) => {
  try {
    const { name, hackathon } = req.query; // Filters
    const { status } = req.body;
    
    // Map team status back to registration status
    const regStatus = status === 'verified' ? 'approved' : status === 'disqualified' ? 'rejected' : 'pending';
    
    await Registration.updateMany({ team_name: name }, { status: regStatus });
    res.json({ message: 'Team protocol synchronized.' });
  } catch (err) {
    res.status(500).json({ error: 'Bulk update failure.' });
  }
};

/**
 * @desc Submissions management
 */
exports.getAllSubmissions = async (req, res) => {
  try {
    const data = await Project.find()
      .populate('created_by', 'username')
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Submission registry scan failed.' });
  }
};

exports.updateSubmission = async (req, res) => {
  try {
    const data = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Submission update failed.' });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Submission node purged.' });
  } catch (err) {
    res.status(500).json({ error: 'Purge failed.' });
  }
};

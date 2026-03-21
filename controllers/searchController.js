const { Project, Hackathon, User } = require('../models');

const globalSearch = async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q) {
      return res.json([]);
    }
    const searchRegex = new RegExp(q, 'i');
    
    let results = [];

    // Search Projects
    if (!category || category === 'all' || category === 'projects') {
      const projects = await Project.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tech_stack: searchRegex }
        ]
      }).limit(10).populate('created_by', 'name username').lean();
      
      results = [...results, ...projects.map(p => ({
        id: p._id,
        category: 'projects',
        title: p.title,
        description: p.description,
        tags: p.tech_stack || [],
        metrics: `${p.stars || 0} Stars`,
        link: `/projects/${p._id}`
      }))];
    }

    // Search Hackathons
    if (!category || category === 'all' || category === 'hackathons') {
      const hackathons = await Hackathon.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }).limit(10).lean();
      
      results = [...results, ...hackathons.map(h => ({
        id: h._id,
        category: 'hackathons',
        title: h.title,
        description: h.description,
        tags: [h.end_date > new Date() ? 'Active' : 'Ended'],
        metrics: `$${h.prize_pool || '0'} Prize`,
        link: `/hackathons/${h._id}`
      }))];
    }

    // Search Developers (Users)
    if (!category || category === 'all' || category === 'developers') {
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { username: searchRegex },
          { bio: searchRegex },
          { skills: searchRegex }
        ]
      }).limit(10).select('-password').lean();
      
      results = [...results, ...users.map(u => ({
        id: u._id,
        category: 'developers',
        title: u.name || u.username,
        description: u.bio || 'Authorized Developer Node',
        tags: u.skills || [],
        metrics: `${u.contributions || 0} Points`,
        link: `/profile/${u.username}`
      }))];
    }

    res.json(results);
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ error: 'Search operation failed.' });
  }
};

module.exports = { globalSearch };

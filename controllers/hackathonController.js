const { Hackathon, Registration } = require('../models');

const getAllHackathons = async (req, res) => {
  try {
<<<<<<< HEAD
    const data = await Hackathon.find({}).sort({ start_date: 1 }).lean();
=======
    const data = await Hackathon.find({}).sort({ start_date: 1 });
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hackathons.' });
  }
};

const getMyHackathons = async (req, res) => {
  try {
<<<<<<< HEAD
    const registrations = await Registration.find({ user_id: req.user.id }).populate('hackathon_id').lean();
    const hackathons = registrations
      .filter(reg => reg.hackathon_id) // Ensure hackathon still exists
      .map(reg => ({
        ...reg.hackathon_id,
        team_name: reg.team_name,
        registered_at: reg.registered_at
      }));
=======
    const registrations = await Registration.find({ user_id: req.user.id }).populate('hackathon_id');
    const hackathons = registrations.map(reg => ({
      ...reg.hackathon_id.toObject(),
      team_name: reg.team_name,
      registered_at: reg.registered_at
    }));
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
    res.json(hackathons);
  } catch (error) {
    console.error('Fetch My Hackathons Error:', error);
    res.status(500).json({ error: 'Failed to fetch your hackathons.' });
  }
};

const getHackathonById = async (req, res) => {
  try {
    const data = await Hackathon.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Hackathon not found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hackathon details.' });
  }
};

const createHackathon = async (req, res) => {
  try {
    const newHack = await Hackathon.create(req.body);
    res.status(201).json(newHack);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hackathon.' });
  }
};

const registerForHackathon = async (req, res) => {
  try {
    const { user_id, hackathon_id, team_name } = req.body;
    const reg = await Registration.create({
      user_id: user_id || req.user?.id,
      hackathon_id,
      team_name,
      registered_at: new Date()
    });
    res.status(201).json(reg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join hackathon.' });
  }
};

const updateHackathon = async (req, res) => {
  try {
    const data = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ message: 'Hackathon not found.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hackathon.' });
  }
};

const deleteHackathon = async (req, res) => {
  try {
    const data = await Hackathon.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ message: 'Hackathon not found.' });
    res.json({ message: 'Hackathon deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hackathon.' });
  }
};

module.exports = {
  getAllHackathons,
  getMyHackathons,
  getHackathonById,
  createHackathon,
  registerForHackathon,
  updateHackathon,
  deleteHackathon
};

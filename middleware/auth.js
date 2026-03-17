const authMiddleware = (req, res, next) => {
  // Simple check for demonstration
  // In a real app, you would verify a JWT or Supabase session here
  const setupKey = req.headers['x-setup-key'];
  
  if (req.method !== 'GET' && setupKey !== process.env.SETUP_KEY) {
    return res.status(401).json({ message: 'Unauthorized execution attempt detected.' });
  }
  
  next();
};

module.exports = authMiddleware;

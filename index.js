const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const authMiddleware = require('./middleware/auth');

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(authMiddleware);

// Import Routes
const projectRoutes = require('./routes/projectRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// API Endpoints
app.use('/api/projects', projectRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// Base Status Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NxtGenSec Development Division API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[SYS] NxtGenSec API active on port ${PORT}`);
  });
}

module.exports = app;

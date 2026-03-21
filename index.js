const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
<<<<<<< HEAD
const { rateLimit } = require('express-rate-limit');
=======
const rateLimit = require('express-rate-limit');
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
<<<<<<< HEAD
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { mailQueue, workerQueue } = require('./config/bull');

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);
=======
const connectDB = require('./config/db');
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57

// Connect to MongoDB
connectDB();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');

// Middleware
app.use(limiter);
<<<<<<< HEAD
// @ts-ignore
=======
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57
app.use(helmet());
app.use(cors({
  origin: [
    'https://vibecodinghackathon.anandverse.space',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true, // Crucial for reading SSR cookies across ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-setup-key']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// Import Routes
const projectRoutes = require('./routes/projectRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const searchRoutes = require('./routes/searchRoutes');

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mail', emailRoutes);
app.use('/api/search', searchRoutes);

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
<<<<<<< HEAD
server.listen(PORT, () => {
  console.log(`[SYS] HackathonOS v2.1 Engine active on port ${PORT}`);
  console.log(`[SYS] Real-time protocols synchronized.`);
  console.log(`[SYS] Background worker queues standby.`);
});

module.exports = server;
=======
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[SYS] NxtGenSec API active on port ${PORT}`);
  });
}

module.exports = app;
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57

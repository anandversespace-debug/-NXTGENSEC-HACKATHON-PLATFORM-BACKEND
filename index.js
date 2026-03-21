const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');

// --- Initialization Block ---
// Vercel Serverless environment optimization:
// We only use standard HTTP responses as WebSockets are not supported in Serverless.
const dbPromise = connectDB();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => !!process.env.VERCEL
});

const { authMiddleware } = require('./middleware/auth');

// Middleware
app.use(limiter);
app.use(cors({
  origin: [
    'https://vibecodinghackathon.anandverse.space',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-setup-key']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Re-inject DB connectivity guarantee for every request in serverless
app.use(async (req, res, next) => {
  await dbPromise;
  next();
});

app.use(authMiddleware);

// --- Routes ---
const routes = {
  auth: require('./routes/authRoutes'),
  projects: require('./routes/projectRoutes'),
  hackathons: require('./routes/hackathonRoutes'),
  blogs: require('./routes/blogRoutes'),
  users: require('./routes/userRoutes'),
  uploads: require('./routes/uploadRoutes'),
  notifications: require('./routes/notificationRoutes'),
  mail: require('./routes/emailRoutes'),
  search: require('./routes/searchRoutes'),
  system: require('./routes/systemRoutes'),
  newsletter: require('./routes/newsletterRoutes'),
  organizer: require('./routes/organizerRoutes')
};

Object.entries(routes).forEach(([name, route]) => {
  app.use(`/api/${name}`, route);
});

// Base Status Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NxtGenSec Pro-Active Backend',
    version: '2.2.0',
    status: 'operational',
    environment: process.env.VERCEL ? 'Vercel Serverless' : 'Production Node',
    sockets: 'disabled',
    timestamp: new Date()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERR]', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// --- Server Lifecycle ---
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[SYS] HackathonOS Engine active on port ${PORT}`);
    console.log(`[SYS] Operating in API-only mode.`);
  });
}

// Export for Vercel/Production
module.exports = app;

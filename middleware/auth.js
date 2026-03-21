const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'nxg_secret_fallback_2026';

    // 1. Check for explicit setup-key (Legacy/Admin bypass for local dev script testing)
    const setupKey = req.headers['x-setup-key'];
    if (setupKey && setupKey === process.env.SETUP_KEY) {
      req.user = { role: 'admin', bypass: true };
      return next();
    }

    const path = req.path || '';
    const normalizedPath = path.replace(/\/$/, '') || '/';
    
    if (process.env.VERCEL) {
      console.log(`[AUTH-DEBUG] [${req.method}] ${normalizedPath}`);
      console.log(`[AUTH-DEBUG] Cookies Found: ${Object.keys(req.cookies || {}).join(', ')}`);
    }
    const isPublicGet = (
      req.method === 'GET' && (
        normalizedPath === '/api/projects' ||
        normalizedPath === '/api/projects/featured' ||
        (normalizedPath.startsWith('/api/projects/') && !['/api/projects/my', '/api/projects/submissions'].includes(normalizedPath)) ||
        normalizedPath === '/api/hackathons' ||
        (normalizedPath.startsWith('/api/hackathons/') && !['/api/hackathons/my'].includes(normalizedPath)) ||
        normalizedPath === '/api/blogs' ||
        normalizedPath.startsWith('/api/blogs/') ||
        normalizedPath === '/api/mail/contact' ||
        normalizedPath === '/api/search' ||
        normalizedPath === '/api/notifications' ||
        normalizedPath === '/api/users' ||
        normalizedPath === '/api/users/leaderboard' ||
        normalizedPath.startsWith('/api/users/profile/') ||
        normalizedPath === '/api/users/public-stats' ||
        normalizedPath === '/api/auth/github' ||
        normalizedPath === '/api/auth/github/callback' ||
        normalizedPath === '/api/auth/verify'
      )
    );

    const isPublicPost = (
      req.method === 'POST' && (
        ['/api/auth/login', '/api/auth/register', '/api/auth/setup', '/api/mail/contact', '/api/mail/forgot-password', '/api/mail/verify', '/api/auth/reset-password', '/api/auth/google'].includes(normalizedPath)
      )
    );

    if (isPublicGet || isPublicPost) {
      // For public routes, still try to populate req.user if token exists
      let token = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies && req.cookies.nxg_auth) {
        token = req.cookies.nxg_auth;
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = decoded;
        } catch (err) {
          // Token invalid but route is public, so we just proceed without user
          console.warn('[AUTH_WARN] Invalid token on public route:', err.message);
        }
      }
      return next();
    }

    // 2. Extract Token from Authorization header OR Cookies
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const headerToken = req.headers.authorization.split(' ')[1];
      if (headerToken && headerToken !== 'null' && headerToken !== 'undefined') {
        token = headerToken;
      }
    }
    
    // Fallback to cookie if no valid header token found
    if (!token && req.cookies && req.cookies.nxg_auth) {
      token = req.cookies.nxg_auth;
    }

    if (!token) {
       console.warn(`[AUTH_MISSING] ${req.method} ${normalizedPath} - No token found.`);
       return res.status(401).json({ error: 'Unauthorized', message: 'No authentication credentials provided.' });
    }

    // 3. Verify JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.warn(`[AUTH_INVALID] ${req.method} ${normalizedPath} - Token verification failed:`, err.message);
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired authentication session.' });
    }

  } catch (error) {
    console.error('[AUTH_ERROR] Middleware verification failed:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Authentication engine failure.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Insufficient permissions for this operation.' 
      });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };

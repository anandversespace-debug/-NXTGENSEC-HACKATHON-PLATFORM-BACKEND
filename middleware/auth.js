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

    // Optional Routes: public endpoints shouldn't block
<<<<<<< HEAD
    const isPublicGet = (
      req.method === 'GET' && (
        req.path === '/api/projects' ||
        req.path === '/api/projects/featured' ||
        req.path.startsWith('/api/projects/') ||
        req.path === '/api/hackathons' ||
        req.path.startsWith('/api/hackathons/') ||
        req.path === '/api/blogs' ||
        req.path.startsWith('/api/blogs/') ||
        req.path === '/api/mail/contact' ||
        req.path === '/api/search'
      )
    );

    const isPublicPost = (
      req.method === 'POST' && (
        ['/api/auth/login', '/api/auth/register', '/api/auth/setup', '/api/mail/contact', '/api/mail/forgot-password', '/api/mail/verify', '/api/auth/reset-password'].includes(req.path)
      )
    );
=======
    const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/projects', '/api/projects/featured', '/api/hackathons', '/api/mail/contact'];
    const isPublicGet = publicPaths.includes(req.path) && req.method === 'GET';
    const isPublicPost = ['/api/auth/login', '/api/auth/register', '/api/auth/setup', '/api/mail/contact', '/api/mail/forgot-password', '/api/mail/verify', '/api/auth/reset-password'].includes(req.path) && req.method === 'POST';
>>>>>>> de51e741803013f3975de7278cc3ae3928561d57

    if (isPublicGet || isPublicPost) {
      return next();
    }

    // 2. Extract Token from Authorization header OR Cookies
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.nxg_auth) {
      token = req.cookies.nxg_auth;
    }

    if (!token) {
       if (req.method === 'GET') return next();
       return res.status(401).json({ error: 'Unauthorized', message: 'No authentication credentials provided.' });
    }

    // 3. Verify JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired authentication session.' });
    }

  } catch (error) {
    console.error('[AUTH_ERROR] Middleware verification failed:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Authentication engine failure.' });
  }
};

module.exports = authMiddleware;

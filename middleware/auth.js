const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token with strict options
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      ignoreExpiration: false
    });
    
    // Validate token claims
    if (decoded.type !== 'access' || !decoded.userId || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token claims'
      });
    }

    // Check token age (optional: reject tokens older than 24h)
    const tokenAge = Date.now() - decoded.iat;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    // Add user from payload
    req.user = { 
      userId: decoded.userId,
      email: decoded.email 
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};
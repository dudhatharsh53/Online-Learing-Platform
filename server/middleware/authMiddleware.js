const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Verifies JWT from either cookie or Authorization header.
 * Attaches the user object to req.user for downstream middleware.
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in httpOnly cookie first
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // Fallback: check Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found, token invalid' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, authorizeAdmin };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from cookie or header
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Please authenticate' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            req.user = user;
            req.userId = user?._id;
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = { authMiddleware, optionalAuth };
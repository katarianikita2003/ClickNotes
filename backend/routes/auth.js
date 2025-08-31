const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Register validation
const registerValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('dateOfBirth').isDate().withMessage('Invalid date of birth'),
    body('qualification').trim().notEmpty().withMessage('Qualification is required'),
    body('mobileNumber').isMobilePhone('en-IN').withMessage('Invalid mobile number')
];

// Login validation
const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, username, email, password, dateOfBirth, qualification, mobileNumber } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }, { mobileNumber }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            if (existingUser.mobileNumber === mobileNumber) {
                return res.status(400).json({ error: 'Mobile number already registered' });
            }
        }

        // Create user
        const user = new User({
            firstName,
            lastName,
            username,
            email,
            password,
            dateOfBirth,
            qualification,
            mobileNumber
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            fullName: req.user.fullName
        }
    });
});

// Verify email (simplified - in production, send actual email)
router.post('/verify-email', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.isEmailVerified = true;
        await user.save();
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Verify mobile (simplified - in production, send actual OTP)
router.post('/verify-mobile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.isMobileVerified = true;
        await user.save();
        res.json({ message: 'Mobile verified successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;
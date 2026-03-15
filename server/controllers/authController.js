const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─── Helper: Set JWT as httpOnly cookie ─────────────────────────────────────
const sendTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,            // Not accessible via JavaScript (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
};

// ─── @route  POST /api/auth/register ────────────────────────────────────────
// @desc   Register a new student
// @access Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // Create new user (password hashed via pre-save hook in model)
        const user = await User.create({ name, email, password, role: 'student' });

        const token = generateToken(user._id);
        sendTokenCookie(res, token);

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                enrolledCourses: user.enrolledCourses,
            },
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// ─── @route  POST /api/auth/login ───────────────────────────────────────────
// @desc   Login user (admin or student)
// @access Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Explicitly select password since it has `select: false` in schema
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        sendTokenCookie(res, token);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                enrolledCourses: user.enrolledCourses,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ─── @route  GET /api/auth/me ────────────────────────────────────────────────
// @desc   Get current logged-in user
// @access Private
const getMe = async (req, res) => {
    try {
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(200).json({ success: true, user: null });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).populate('enrolledCourses', 'title thumbnail');
        if (!user) {
            return res.status(200).json({ success: true, user: null });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        // Token expired/invalid, return null smoothly avoiding console error 401
        res.status(200).json({ success: true, user: null });
    }
};

// ─── @route  POST /api/auth/logout ──────────────────────────────────────────
// @desc   Logout user by clearing the cookie
// @access Private
const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };

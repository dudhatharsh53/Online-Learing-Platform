require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

// Initialize Express app
const app = express();

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ].filter(Boolean),
    credentials: true, // Allow cookies to be sent cross-origin
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/faculty', facultyRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'LMS API is running' });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

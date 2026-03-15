const express = require('express');
const router = express.Router();
const {
    markLectureComplete,
    getCourseProgress,
    getAllStudentsProgress,
    getCourseProgressAdmin,
    getMyProgress,
    watchVideo
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isStudent } = require('../middleware/roleMiddleware');

// IMPORTANT: Specific named routes MUST come before wildcard /:courseId

// Admin routes (before /:courseId)
router.get('/admin/all', protect, isAdmin, getAllStudentsProgress);
router.get('/admin/course/:courseId', protect, isAdmin, getCourseProgressAdmin);

// Student routes
router.post('/mark', protect, isStudent, markLectureComplete);
router.post('/video/watch', protect, isStudent, watchVideo);
router.get('/my', protect, isStudent, getMyProgress);

// Wildcard route LAST — otherwise it swallows /my and /admin/*
router.get('/:courseId', protect, getCourseProgress);

module.exports = router;

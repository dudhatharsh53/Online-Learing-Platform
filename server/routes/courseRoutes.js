const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    getAdminCourses,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isStudent } = require('../middleware/roleMiddleware');
const { uploadImage } = require('../config/cloudinary');

// Public routes
router.get('/', getAllCourses);

// Admin-only: get all courses including drafts — must come BEFORE /:id
router.get('/admin/all', protect, isAdmin, getAdminCourses);

// Protected: single course (users must be logged in to view)
router.get('/:id', protect, getCourseById);

// Admin: create/update/delete course (thumbnail upload via multer)
router.post('/', protect, isAdmin, uploadImage.single('thumbnail'), createCourse);
router.put('/:id', protect, isAdmin, uploadImage.single('thumbnail'), updateCourse);
router.delete('/:id', protect, isAdmin, deleteCourse);

// Student: enroll
router.post('/:id/enroll', protect, isStudent, enrollInCourse);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    uploadLecture,
    getLecturesByCourse,
    getSingleLecture,
    updateLecture,
    deleteLecture,
} = require('../controllers/lectureController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const multer = require('multer');

// Use memory storage so we can stream to Cloudinary manually
const upload = multer({ storage: multer.memoryStorage() });

// Fields: video (single) + pdf (single)
const lectureUpload = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
]);

// @route POST   /api/lectures/:courseId  → upload lecture to course
router.post('/:courseId', protect, isAdmin, lectureUpload, uploadLecture);

// @route GET    /api/lectures/single/:lectureId  — MUST come before /:courseId wildcard
router.get('/single/:lectureId', protect, getSingleLecture);

// @route GET    /api/lectures/:courseId  → get all lectures for course
router.get('/:courseId', protect, getLecturesByCourse);

// @route PUT    /api/lectures/:lectureId
router.put('/:lectureId', protect, isAdmin, lectureUpload, updateLecture);

// @route DELETE /api/lectures/:lectureId
router.delete('/:lectureId', protect, isAdmin, deleteLecture);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getStats,
    getStudentProgress,
    getStudentDetails,
    getRecentActivity,
    getPayments,
    getStudents,
    updateStudent,
    deleteStudent
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// All routes here are protected and require admin role
router.use(protect);
router.use(authorizeAdmin);

router.get('/stats', getStats);
router.get('/student-progress', getStudentProgress);
router.get('/student/:id/details', getStudentDetails);
router.get('/recent-activity', getRecentActivity);
router.get('/payments', getPayments);
router.get('/students', getStudents);
router.put('/student/:id', updateStudent);
router.delete('/student/:id', deleteStudent);

module.exports = router;

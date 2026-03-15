const express = require('express');
const router = express.Router();
const {
    getFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getFaculties);
router.get('/:id', getFacultyById);

// Admin routes
router.post('/', protect, isAdmin, createFaculty);
router.put('/:id', protect, isAdmin, updateFaculty);
router.delete('/:id', protect, isAdmin, deleteFaculty);

module.exports = router;

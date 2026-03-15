const Faculty = require('../models/Faculty');
const asyncHandler = require('express-async-handler');

// @desc    Get all faculty members
// @route   GET /api/faculty
// @access  Public
const getFaculties = asyncHandler(async (req, res) => {
    const faculties = await Faculty.find({});
    res.status(200).json({
        success: true,
        count: faculties.length,
        faculties
    });
});

// @desc    Get single faculty member
// @route   GET /api/faculty/:id
// @access  Public
const getFacultyById = asyncHandler(async (req, res) => {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
        res.status(404);
        throw new Error('Faculty not found');
    }

    res.status(200).json({
        success: true,
        faculty
    });
});

// @desc    Create a new faculty member
// @route   POST /api/faculty
// @access  Private/Admin
const createFaculty = asyncHandler(async (req, res) => {
    const { name, email, description, profileImage } = req.body;

    const facultyExists = await Faculty.findOne({ email });

    if (facultyExists) {
        res.status(400);
        throw new Error('Faculty with this email already exists');
    }

    const faculty = await Faculty.create({
        name,
        email,
        description,
        profileImage
    });

    res.status(201).json({
        success: true,
        faculty
    });
});

// @desc    Update a faculty member
// @route   PUT /api/faculty/:id
// @access  Private/Admin
const updateFaculty = asyncHandler(async (req, res) => {
    const { name, email, description, profileImage } = req.body;

    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
        res.status(404);
        throw new Error('Faculty not found');
    }

    faculty.name = name || faculty.name;
    faculty.email = email || faculty.email;
    faculty.description = description || faculty.description;
    faculty.profileImage = profileImage || faculty.profileImage;

    const updatedFaculty = await faculty.save();

    res.status(200).json({
        success: true,
        faculty: updatedFaculty
    });
});

// @desc    Delete a faculty member
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
const deleteFaculty = asyncHandler(async (req, res) => {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
        res.status(404);
        throw new Error('Faculty not found');
    }

    await faculty.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Faculty member removed'
    });
});

module.exports = {
    getFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty
};

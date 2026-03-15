const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { cloudinary } = require('../config/cloudinary');

// ─── @route  GET /api/courses ────────────────────────────────────────────────
// @desc   Get all published courses (with optional category filter & search)
// @access Public
const getAllCourses = async (req, res) => {
    try {
        const { category, search, level } = req.query;
        const filter = { isPublished: true };

        if (category && category !== 'All') filter.category = category;
        if (level && level !== 'All') filter.level = level;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const courses = await Course.find(filter)
            .select('-enrolledStudents')
            .populate('faculty', 'name profileImage')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/courses/:id ───────────────────────────────────────────
// @desc   Get a single course with its lectures
// @access Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('lectures', 'title description duration order isFreePreview videoUrl pdfUrl pdfName')
            .populate('enrolledStudents', 'name email')
            .populate('faculty');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Project requirement: Hide video URL if not enrolled and not admin
        const userId = req.user?._id;
        const isAdmin = req.user?.role === 'admin';
        const isEnrolled = course.enrolledStudents.some(s => s._id.toString() === userId?.toString() || s.toString() === userId?.toString());

        if (!isAdmin && !isEnrolled) {
            course.promoVideoUrl = ''; // Hide the video URL
        }

        res.status(200).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  POST /api/courses ──────────────────────────────────────────────
// @desc   Create a new course (Admin only)
// @access Private/Admin
const createCourse = async (req, res) => {
    try {
        const { title, description, category, instructor, price, level, promoVideoUrl, faculty } = req.body;

        if (!title || !description || !category || !instructor) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Handle thumbnail upload (file comes via multer)
        let thumbnailUrl = '';
        if (req.file) {
            thumbnailUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary
        }

        const course = await Course.create({
            title,
            description,
            category,
            instructor,
            instructorId: req.user._id,
            thumbnail: thumbnailUrl,
            promoVideoUrl: promoVideoUrl || '',
            price: price || 0,
            level: level || 'Beginner',
            faculty: faculty || undefined,
        });

        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  PUT /api/courses/:id ───────────────────────────────────────────
// @desc   Update a course (Admin only)
// @access Private/Admin
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const { title, description, category, instructor, price, level, isPublished, promoVideoUrl, faculty } = req.body;

        // Handle thumbnail replacement
        let thumbnailUrl = course.thumbnail;
        if (req.file) {
            // Delete old thumbnail from Cloudinary if it exists
            if (course.thumbnail) {
                // Extract public_id from URL
                const segments = course.thumbnail.split('/');
                const fileWithExt = segments[segments.length - 1];
                const publicId = `lms/thumbnails/${fileWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            }
            thumbnailUrl = req.file.path;
        }

        const updated = await Course.findByIdAndUpdate(
            req.params.id,
            {
                title: title || course.title,
                description: description || course.description,
                category: category || course.category,
                instructor: instructor || course.instructor,
                price: price !== undefined ? price : course.price,
                level: level || course.level,
                isPublished: isPublished !== undefined ? isPublished : course.isPublished,
                thumbnail: thumbnailUrl,
                promoVideoUrl: promoVideoUrl !== undefined ? promoVideoUrl : course.promoVideoUrl,
                faculty: faculty !== undefined ? faculty : course.faculty,
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, course: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  DELETE /api/courses/:id ────────────────────────────────────────
// @desc   Delete a course and its lectures (Admin only)
// @access Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('lectures');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Delete all lectures' Cloudinary assets and DB records
        for (const lecture of course.lectures) {
            if (lecture.videoPublicId) {
                await cloudinary.uploader.destroy(lecture.videoPublicId, { resource_type: 'video' });
            }
            if (lecture.pdfPublicId) {
                await cloudinary.uploader.destroy(lecture.pdfPublicId, { resource_type: 'raw' });
            }
            await Lecture.findByIdAndDelete(lecture._id);
        }

        // Delete thumbnail from Cloudinary
        if (course.thumbnail) {
            const segments = course.thumbnail.split('/');
            const fileWithExt = segments[segments.length - 1];
            const publicId = `lms/thumbnails/${fileWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        }

        // Remove course from all enrolled students
        await User.updateMany(
            { enrolledCourses: course._id },
            { $pull: { enrolledCourses: course._id } }
        );

        // Delete all progress records for this course
        await Progress.deleteMany({ courseId: course._id });

        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  POST /api/courses/:id/enroll ───────────────────────────────────
// @desc   Enroll logged-in student in a course
// @access Private/Student
const enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const userId = req.user._id;

        // Check if already enrolled
        if (course.enrolledStudents.includes(userId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Add student to course
        course.enrolledStudents.push(userId);
        await course.save();

        // Add course to student's profile
        await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: course._id } });

        // Create a progress document for tracking
        await Progress.create({
            userId,
            courseId: course._id,
            completedVideos: [],
            videoProgress: [],
            progressPercent: 0,
        });

        // Return course populated with lectures so frontend can navigate to first lecture immediately
        const populatedCourse = await Course.findById(course._id)
            .populate('lectures', 'title description duration order isFreePreview videoUrl pdfUrl pdfName')
            .populate('enrolledStudents', 'name email');

        res.status(200).json({ success: true, message: 'Enrolled successfully', course: populatedCourse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/courses/admin/all ─────────────────────────────────────
// @desc   Get ALL courses including drafts (Admin only)
// @access Private/Admin
const getAdminCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    getAdminCourses,
};

const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// ─── Helper: Upload buffer to Cloudinary via stream ─────────────────────────
const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// ─── @route  POST /api/lectures/:courseId ───────────────────────────────────
// @desc   Upload a new lecture (video + optional PDF) to a course
// @access Private/Admin
const uploadLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, order, isFreePreview, youtubeUrl } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!title) {
            return res.status(400).json({ message: 'Lecture title is required' });
        }

        const files = req.files; // uploaded by multer (memoryStorage)
        let videoUrl = '';
        let videoPublicId = '';
        let pdfUrl = '';
        let pdfPublicId = '';
        let pdfName = '';
        let duration = 0;

        // Upload video to Cloudinary
        if (files && files.video && files.video[0]) {
            const videoFile = files.video[0];
            const videoResult = await uploadToCloudinary(videoFile.buffer, {
                folder: 'lms/videos',
                resource_type: 'video',
            });
            videoUrl = videoResult.secure_url;
            videoPublicId = videoResult.public_id;
            duration = Math.round(videoResult.duration || 0);
        }

        // Upload PDF to Cloudinary
        if (files && files.pdf && files.pdf[0]) {
            const pdfFile = files.pdf[0];
            const pdfResult = await uploadToCloudinary(pdfFile.buffer, {
                folder: 'lms/pdfs',
                resource_type: 'raw',
            });
            pdfUrl = pdfResult.secure_url;
            pdfPublicId = pdfResult.public_id;
            pdfName = pdfFile.originalname;
        }

        // Create lecture document
        const lecture = await Lecture.create({
            title,
            description: description || '',
            videoUrl,
            videoPublicId,
            pdfUrl,
            pdfPublicId,
            pdfName,
            course: courseId,
            duration,
            order: order ? parseInt(order) : course.lectures.length + 1,
            isFreePreview: isFreePreview === 'true' || isFreePreview === true,
            youtubeUrl: youtubeUrl || '',
        });

        // Add lecture reference to course
        await Course.findByIdAndUpdate(courseId, { $push: { lectures: lecture._id } });

        res.status(201).json({ success: true, lecture });
    } catch (error) {
        console.error('Upload lecture error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/lectures/:courseId ────────────────────────────────────
// @desc   Get all lectures for a course (enrolled students or admin)
// @access Private
const getLecturesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If student, verify enrollment
        if (req.user.role === 'student') {
            const isEnrolled = course.enrolledStudents.includes(req.user._id);
            if (!isEnrolled) {
                return res.status(403).json({ message: 'Please enroll in this course first' });
            }
        }

        const lectures = await Lecture.find({ course: courseId }).sort({ order: 1 });
        res.status(200).json({ success: true, lectures });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/lectures/single/:lectureId ────────────────────────────
// @desc   Get a single lecture by ID
// @access Private
const getSingleLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId).populate('course', 'title enrolledStudents');
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        // Verify access: must be admin or enrolled student
        if (req.user.role === 'student') {
            const isEnrolled = lecture.course.enrolledStudents.includes(req.user._id);
            if (!isEnrolled && !lecture.isFreePreview) {
                return res.status(403).json({ message: 'Please enroll in this course first' });
            }
        }

        res.status(200).json({ success: true, lecture });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  PUT /api/lectures/:lectureId ───────────────────────────────────
// @desc   Update lecture details (Admin only)
// @access Private/Admin
const updateLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const { title, description, order, isFreePreview, youtubeUrl } = req.body;
        const files = req.files;

        let videoUrl = lecture.videoUrl;
        let videoPublicId = lecture.videoPublicId;
        let pdfUrl = lecture.pdfUrl;
        let pdfPublicId = lecture.pdfPublicId;
        let pdfName = lecture.pdfName;
        let duration = lecture.duration;

        // Replace video if new file provided
        if (files && files.video && files.video[0]) {
            if (lecture.videoPublicId) {
                await cloudinary.uploader.destroy(lecture.videoPublicId, { resource_type: 'video' });
            }
            const videoResult = await uploadToCloudinary(files.video[0].buffer, {
                folder: 'lms/videos',
                resource_type: 'video',
            });
            videoUrl = videoResult.secure_url;
            videoPublicId = videoResult.public_id;
            duration = Math.round(videoResult.duration || 0);
        }

        // Replace PDF if new file provided
        if (files && files.pdf && files.pdf[0]) {
            if (lecture.pdfPublicId) {
                await cloudinary.uploader.destroy(lecture.pdfPublicId, { resource_type: 'raw' });
            }
            const pdfResult = await uploadToCloudinary(files.pdf[0].buffer, {
                folder: 'lms/pdfs',
                resource_type: 'raw',
            });
            pdfUrl = pdfResult.secure_url;
            pdfPublicId = pdfResult.public_id;
            pdfName = files.pdf[0].originalname;
        }

        const updated = await Lecture.findByIdAndUpdate(
            req.params.lectureId,
            {
                title: title || lecture.title,
                description: description !== undefined ? description : lecture.description,
                videoUrl,
                videoPublicId,
                pdfUrl,
                pdfPublicId,
                pdfName,
                order: order !== undefined ? parseInt(order) : lecture.order,
                isFreePreview: isFreePreview !== undefined ? isFreePreview === 'true' || isFreePreview === true : lecture.isFreePreview,
                duration,
                youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : lecture.youtubeUrl,
            },
            { new: true }
        );

        res.status(200).json({ success: true, lecture: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  DELETE /api/lectures/:lectureId ────────────────────────────────
// @desc   Delete a lecture and its Cloudinary assets (Admin only)
// @access Private/Admin
const deleteLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        // Delete video from Cloudinary
        if (lecture.videoPublicId) {
            await cloudinary.uploader.destroy(lecture.videoPublicId, { resource_type: 'video' });
        }

        // Delete PDF from Cloudinary
        if (lecture.pdfPublicId) {
            await cloudinary.uploader.destroy(lecture.pdfPublicId, { resource_type: 'raw' });
        }

        // Remove lecture reference from course
        await Course.findByIdAndUpdate(lecture.course, { $pull: { lectures: lecture._id } });

        await Lecture.findByIdAndDelete(req.params.lectureId);

        res.status(200).json({ success: true, message: 'Lecture deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadLecture,
    getLecturesByCourse,
    getSingleLecture,
    updateLecture,
    deleteLecture,
};

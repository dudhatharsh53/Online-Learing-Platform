const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');

// ─── @route  POST /api/progress/mark ────────────────────────────────────────
// @desc   Mark a lecture as completed and update progress %
// @access Private/Student
const markLectureComplete = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body;
        const userId = req.user._id;

        if (!courseId || !lectureId) {
            return res.status(400).json({ message: 'courseId and lectureId are required' });
        }

        // Verify the course and lecture exist
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        // Verify the student is enrolled
        if (!course.enrolledStudents.includes(userId)) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }

        // Find or create progress document
        let progress = await Progress.findOne({ userId, courseId });
        if (!progress) {
            progress = await Progress.create({
                userId,
                courseId,
                completedVideos: [],
                videoProgress: [],
                progressPercent: 0,
            });
        }

        // Add lecture if not already marked complete
        if (!progress.completedVideos.includes(lectureId)) {
            progress.completedVideos.push(lectureId);
        }

        // Add to videoProgress with 100%
        const vpIdx = progress.videoProgress.findIndex(v => v.videoId.toString() === lectureId);
        if (vpIdx > -1) {
            progress.videoProgress[vpIdx].percentage = 100;
        } else {
            progress.videoProgress.push({ videoId: lectureId, percentage: 100 });
        }

        // Update "last watched"
        progress.lastWatched = lectureId;

        // Recalculate progress percentage
        const totalLectures = course.lectures.length;
        if (totalLectures > 0) {
            progress.progressPercent = Math.round(
                (progress.completedVideos.length / totalLectures) * 100
            );
        }

        await progress.save();

        res.status(200).json({
            success: true,
            progress: {
                completedVideos: progress.completedVideos,
                progressPercent: progress.progressPercent,
                lastWatched: progress.lastWatched,
                videoProgress: progress.videoProgress
            },
        });
    } catch (error) {
        console.error('markLectureComplete error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/progress/:courseId ────────────────────────────────────
// @desc   Get the student's progress for a specific course
// @access Private/Student
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const progress = await Progress.findOne({ userId, courseId })
            .populate('completedVideos', 'title')
            .populate('lastWatched', 'title');

        if (!progress) {
            return res.status(200).json({
                success: true,
                progress: {
                    completedVideos: [],
                    videoProgress: [],
                    progressPercent: 0,
                    lastWatched: null,
                },
            });
        }

        res.status(200).json({ success: true, progress });
    } catch (error) {
        console.error('getCourseProgress error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/progress/admin/all ────────────────────────────────────
// @desc   Get all students' progress (Admin only)
// @access Private/Admin
const getAllStudentsProgress = async (req, res) => {
    try {
        const progressList = await Progress.find({})
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, progressList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/progress/admin/course/:courseId ───────────────────────
// @desc   Get all students' progress for a specific course (Admin only)
// @access Private/Admin
const getCourseProgressAdmin = async (req, res) => {
    try {
        const progressList = await Progress.find({ courseId: req.params.courseId })
            .populate('userId', 'name email avatar')
            .populate('completedVideos', 'title')
            .sort({ progressPercent: -1 });

        res.status(200).json({ success: true, progressList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  GET /api/progress/my ───────────────────────────────────────────
// @desc   Get all progress entries for the logged-in student
// @access Private/Student
const getMyProgress = async (req, res) => {
    try {
        const progressList = await Progress.find({ userId: req.user._id })
            .populate('courseId', 'title thumbnail instructor category')
            .populate('lastWatched', 'title');

        // Remap fields slightly if client expects old naming
        const results = progressList.map(p => ({
            ...p.toObject(),
            course: p.courseId, // Backwards compat for student dashboard
            progressPercent: p.progressPercent
        }));

        res.status(200).json({ success: true, progressList: results });
    } catch (error) {
        console.error('getMyProgress error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── @route  POST /api/progress/video/watch ─────────────────────────────────
// @desc   Set per-video progress and update course completion %
// @access Private/Student
const watchVideo = async (req, res) => {
    try {
        const { courseId, videoId, percentage } = req.body;
        const userId = req.user._id;

        if (!courseId || !videoId) {
            return res.status(400).json({ message: 'courseId and videoId are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Find or create progress document using unified Progress model
        let progress = await Progress.findOne({ userId, courseId });
        if (!progress) {
            progress = await Progress.create({
                userId,
                courseId,
                completedVideos: [],
                videoProgress: [],
                progressPercent: 0,
                lastWatched: videoId
            });
        }

        // Update video progress percentage
        const vpIdx = progress.videoProgress.findIndex(v => v.videoId.toString() === videoId);
        if (vpIdx > -1) {
            if (percentage > progress.videoProgress[vpIdx].percentage) {
                progress.videoProgress[vpIdx].percentage = percentage;
            }
        } else {
            progress.videoProgress.push({ videoId, percentage: percentage || 0 });
        }

        // If 100% complete, add to completedVideos
        if (percentage >= 100 && !progress.completedVideos.includes(videoId)) {
            progress.completedVideos.push(videoId);
        }

        // Recalculate course broad progress %
        const totalLecs = course.lectures.length;
        if (totalLecs > 0) {
            // How many unique videos are 100%?
            const countDone = progress.completedVideos.length;
            progress.progressPercent = Math.round((countDone / totalLecs) * 100);
        }

        progress.lastWatched = videoId;
        await progress.save();

        res.status(200).json({
            success: true,
            progress: {
                completedVideos: progress.completedVideos,
                videoProgress: progress.videoProgress,
                progressPercent: progress.progressPercent,
                lastWatched: progress.lastWatched
            },
        });
    } catch (error) {
        console.error('watchVideo error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markLectureComplete,
    getCourseProgress,
    getAllStudentsProgress,
    getCourseProgressAdmin,
    getMyProgress,
    watchVideo
};

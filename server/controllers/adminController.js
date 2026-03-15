const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lecture = require('../models/Lecture');
const Payment = require('../models/Payment');

// @route   GET /api/admin/stats
// @desc    Get dashboard summary statistics
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();

        // Calculate average completion percentage across all student progress records
        const progressRecords = await Progress.find();

        let totalCompletion = 0;
        if (progressRecords.length > 0) {
            totalCompletion = progressRecords.reduce((acc, p) => acc + (p.progressPercent || 0), 0);
        }

        const averageCompletionPercentage = progressRecords.length > 0
            ? (totalCompletion / progressRecords.length).toFixed(2)
            : 0;

        // Sum total payments
        const payments = await Payment.find();
        const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalCourses,
                avgProgress: Number(averageCompletionPercentage),
                totalPayments
            },
        });
    } catch (error) {
        console.error('getStats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// @route   GET /api/admin/student-progress
// @desc    Get list of student progress overview
// @access  Private/Admin
const getStudentProgress = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name email');

        const results = [];

        for (const student of students) {
            const progressList = await Progress.find({ userId: student._id })
                .populate('courseId', 'title lectures');

            if (progressList.length === 0) {
                results.push({
                    studentName: student.name,
                    studentEmail: student.email,
                    courseName: 'Not Enrolled',
                    totalVideos: 0,
                    completedVideos: 0,
                    completionPercentage: 0,
                    studentId: student._id
                });
            } else {
                for (const record of progressList) {
                    const totalVideos = record.courseId?.lectures?.length || 0;
                    const completedCount = record.completedVideos?.length || 0;
                    const percentage = record.progressPercent || 0;

                    results.push({
                        studentName: student.name,
                        studentEmail: student.email,
                        courseName: record.courseId ? record.courseId.title : 'Deleted Course',
                        totalVideos,
                        completedVideos: completedCount,
                        completionPercentage: percentage,
                        studentId: student._id
                    });
                }
            }
        }

        res.status(200).json({ success: true, studentProgress: results });
    } catch (error) {
        console.error('getStudentProgress error:', error);
        res.status(500).json({ message: 'Server error fetching student progress' });
    }
};

// @route   GET /api/admin/student/:id/details
// @desc    Get detailed progress for a specific student
// @access  Private/Admin
const getStudentDetails = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const progressRecords = await Progress.find({ userId: student._id })
            .populate('courseId', 'title lectures');

        const courseProgress = await Promise.all(progressRecords.map(async (record) => {
            const allVideos = record.courseId?.lectures || [];

            // Populating them manually if needed or assuming they are IDs
            const populatedLecs = await Lecture.find({ _id: { $in: allVideos } }).sort('order');

            const completedSet = new Set(record.completedVideos?.map(id => id.toString()));

            const videoList = populatedLecs.map(v => ({
                title: v.title,
                completed: completedSet.has(v._id.toString()),
                lastWatchedAt: record.updatedAt
            }));

            return {
                courseName: record.courseId?.title || 'Unknown',
                totalVideos: populatedLecs.length,
                completedVideos: record.completedVideos?.length || 0,
                completionPercentage: record.progressPercent || 0,
                videos: videoList
            };
        }));

        res.status(200).json({
            success: true,
            student,
            courseProgress
        });
    } catch (error) {
        console.error('getStudentDetails error:', error);
        res.status(500).json({ message: 'Server error fetching student details' });
    }
};

// @route   GET /api/admin/recent-activity
// @desc    Get recently active students
// @access  Private/Admin
const getRecentActivity = async (req, res) => {
    try {
        const recentProgress = await Progress.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        const activities = recentProgress.map(record => ({
            user: record.userId || { name: 'Unknown' },
            course: record.courseId || { title: 'Deleted' },
            action: record.progressPercent === 100 ? 'Completed a course' : 'Watched a lecture',
            timestamp: record.updatedAt
        }));

        res.status(200).json({ success: true, activities });
    } catch (error) {
        console.error('getRecentActivity error:', error);
        res.status(500).json({ message: 'Server error fetching recent activity' });
    }
};

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private/Admin
const getPayments = async (req, res) => {
    try {
        const { days } = req.query;
        let query = {};
        if (days) {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(days));
            query.createdAt = { $gte: date };
        }

        const payments = await Payment.find(query)
            .populate('student', 'name email')
            .populate('course', 'title price')
            .sort({ createdAt: -1 });

        const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        res.status(200).json({
            success: true,
            payments,
            totalPayments,
            count: payments.length
        });
    } catch (error) {
        console.error('getPayments error:', error);
        res.status(500).json({ message: 'Server error fetching payments' });
    }
};

// @route   GET /api/admin/students
// @desc    Get all users for student list
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await User.find({}).sort({ createdAt: -1 }).select('-password');
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error('getStudents error:', error);
        res.status(500).json({ message: 'Server error fetching students' });
    }
}

// @route   PUT /api/admin/student/:id
// @desc    Update student profile (Admin only)
// @access  Private/Admin
const updateStudent = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const student = await User.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (name) student.name = name;
        if (email) student.email = email;
        if (role) student.role = role;

        const updatedStudent = await student.save();
        res.status(200).json({ success: true, student: updatedStudent });
    } catch (error) {
        console.error('updateStudent error:', error);
        res.status(500).json({ message: 'Server error updating student' });
    }
};

// @route   DELETE /api/admin/student/:id
// @desc    Delete a student (Admin only)
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        await Progress.deleteMany({ userId: req.params.id });

        res.status(200).json({ success: true, message: 'Student removed from system' });
    } catch (error) {
        console.error('deleteStudent error:', error);
        res.status(500).json({ message: 'Server error deleting student' });
    }
};

module.exports = {
    getStats,
    getStudentProgress,
    getStudentDetails,
    getRecentActivity,
    getPayments,
    getStudents,
    updateStudent,
    deleteStudent
};

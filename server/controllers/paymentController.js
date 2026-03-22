const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Payment = require('../models/Payment');
const asyncHandler = require('express-async-handler');

// @desc    Create Razorpay Order
// @route   POST /api/payment/order/:courseId
// @access  Private/Student
const createOrder = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if user is already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already enrolled in this course');
    }

    const options = {
        amount: Math.round(course.price * 100), // amount in the smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${courseId}_${req.user._id}`.substring(0, 40),
    };

    if (!razorpay) {
        res.status(500);
        throw new Error('Razorpay is not configured. Please check server .env');
    }

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order,
            course: {
                title: course.title,
                price: course.price,
                thumbnail: course.thumbnail
            }
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500);
        throw new Error('Failed to create Razorpay order');
    }
});

// @desc    Verify Razorpay Payment and Enroll Student
// @route   POST /api/payment/verify
// @access  Private/Student
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, isMock } = req.body;


    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy')
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Find course to get the price
        const course = await Course.findById(courseId);
        return await enrollStudent(courseId, req.user._id, res, razorpay_payment_id, razorpay_order_id, course.price);
    } else {
        res.status(400);
        throw new Error('Invalid payment signature');
    }
});

// Helper to keep code clean
async function enrollStudent(courseId, userId, res, paymentId, orderId, amount) {
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (course.enrolledStudents.includes(userId)) {
        return res.status(200).json({ success: true, message: 'Already enrolled' });
    }

    course.enrolledStudents.push(userId);
    await course.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: course._id } });

    // Record Payment
    if (paymentId && orderId) {
        await Payment.create({
            student: userId,
            course: course._id,
            amount: amount || course.price,
            paymentId,
            orderId,
            status: 'captured'
        });
    }

    try {
        const progressExists = await Progress.findOne({ userId, courseId: course._id });
        if (!progressExists) {
            await Progress.create({
                userId,
                courseId: course._id,
                completedVideos: [],
                progressPercent: 0,
            });
        }
    } catch (err) {
        console.error('Progress creation error (likely duplicate):', err.message);
        // Continue even if progress record fails (e.g. indexing race condition)
    }

    return res.status(200).json({
        success: true,
        message: 'Payment verified and enrolled successfully',
        courseId
    });
}

module.exports = {
    createOrder,
    verifyPayment
};

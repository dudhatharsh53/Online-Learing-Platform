const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentId: {
            type: String, // Razorpay payment ID
            required: true,
        },
        orderId: {
            type: String, // Razorpay order ID
            required: true,
        },
        status: {
            type: String,
            default: 'captured',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

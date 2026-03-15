const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Video title is required'],
            trim: true,
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
        },
        duration: {
            type: Number, // Duration in seconds
            default: 0,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);

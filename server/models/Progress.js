const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        completedVideos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lecture',
            },
        ],
        videoProgress: [
            {
                videoId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Lecture',
                },
                percentage: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        progressPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        lastWatched: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture',
            default: null,
        },
    },
    { timestamps: true }
);

// Unified index: one progress record per user per course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

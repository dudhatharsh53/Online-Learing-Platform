const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Lecture title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        videoUrl: {
            type: String, // Cloudinary video URL
            default: '',
        },
        videoPublicId: {
            type: String, // Cloudinary public_id for deletion
            default: '',
        },
        youtubeUrl: {
            type: String, // YouTube video URL
            default: '',
        },
        pdfUrl: {
            type: String, // Cloudinary PDF URL
            default: '',
        },
        pdfPublicId: {
            type: String, // Cloudinary public_id for deletion
            default: '',
        },
        pdfName: {
            type: String,
            default: '',
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        duration: {
            type: Number, // Duration in seconds
            default: 0,
        },
        order: {
            type: Number, // Order within the course
            default: 0,
        },
        isFreePreview: {
            type: Boolean,
            default: false, // Can non-enrolled users view this?
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);

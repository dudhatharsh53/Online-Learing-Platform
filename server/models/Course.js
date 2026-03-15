const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },
        description: {
            type: String,
            required: [true, 'Course description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        thumbnail: {
            type: String, // Cloudinary URL
            default: '',
        },
        promoVideoUrl: {
            type: String, // YouTube Link
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'Web Development',
                'Mobile Development',
                'Data Science',
                'Machine Learning',
                'DevOps',
                'Design',
                'Business',
                'Marketing',
                'Other',
            ],
        },
        instructor: {
            type: String,
            required: [true, 'Instructor name is required'],
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty',
        },
        lectures: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lecture',
            },
        ],
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        enrolledStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        price: {
            type: Number,
            default: 0, // 0 = free
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
    },
    { timestamps: true }
);

// Virtual field: count of lectures
courseSchema.virtual('lectureCount').get(function () {
    return this.lectures.length;
});

module.exports = mongoose.model('Course', courseSchema);

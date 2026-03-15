const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Faculty name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Faculty email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        description: {
            type: String,
            required: [true, 'Bio/Description is required'],
        },
        profileImage: {
            type: String, // URL
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);

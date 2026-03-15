const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Progress = require('./models/Progress');
const Course = require('./models/Course');
const User = require('./models/User');

dotenv.config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms';

console.log('Connecting to:', MONGODB_URI);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        const resProg = await Progress.deleteMany({});
        console.log(`Deleted ${resProg.deletedCount} progress records.`);

        const resUser = await User.updateMany({}, { $set: { enrolledCourses: [] } });
        console.log(`Reset enrolledCourses for Users. Modified: ${resUser.modifiedCount}`);

        const resCourse = await Course.updateMany({}, { $set: { enrolledStudents: [] } });
        console.log(`Reset enrolledStudents for Courses. Modified: ${resCourse.modifiedCount}`);

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

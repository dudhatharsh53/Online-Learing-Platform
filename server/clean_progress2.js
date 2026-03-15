const mongoose = require('mongoose');

// Define minimal schemas to avoid require errors
const ProgressSchema = new mongoose.Schema({}, { strict: false });
const CourseSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });

const Progress = mongoose.model('Progress', ProgressSchema);
const Course = mongoose.model('Course', CourseSchema);
const User = mongoose.model('User', UserSchema);

const uri = "mongodb://127.0.0.1:27017/lms";

console.log('Connecting to:', uri);
mongoose.connect(uri)
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

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Video = require('../models/Video');
const User = require('../models/User');

const seedITCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // 1. Get an admin user to act as instructor
        const admin = await User.findOne({ role: 'admin' });
        const instructorId = admin ? admin._id : null;
        const instructorName = admin ? admin.name : 'System Admin';

        // 2. Clear existing courses and videos (Optional - for clean seed)
        // await Course.deleteMany({});
        // await Video.deleteMany({});

        const itCourses = [
            {
                title: 'Full Stack Web Development (MERN)',
                description: 'Master the MERN stack (MongoDB, Express, React, Node) from scratch. Build world-class web applications.',
                category: 'Web Development',
                instructor: instructorName,
                instructorId: instructorId,
                level: 'Intermediate',
                price: 49.99,
                videos: [
                    { title: 'Introduction to MERN Stack', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 180 },
                    { title: 'React Hooks and Patterns', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 320 },
                    { title: 'Node.js and Express Backend', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 450 },
                ]
            },
            {
                title: 'Python for Data Science',
                description: 'Learn Python, NumPy, Pandas, and Matplotlib for data analysis and visualization.',
                category: 'Data Science',
                instructor: instructorName,
                instructorId: instructorId,
                level: 'Beginner',
                price: 39.99,
                videos: [
                    { title: 'Python Basics for Data Science', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 240 },
                    { title: 'Data Cleaning with Pandas', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 380 },
                    { title: 'Visualizing Data with Matplotlib', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 300 },
                ]
            },
            {
                title: 'Cyber Security Essentials',
                description: 'Understand the core concepts of ethical hacking, networking, and system security.',
                category: 'Other', // Model doesn't have Cyber Security enum, using Other or mapping
                instructor: instructorName,
                instructorId: instructorId,
                level: 'Beginner',
                price: 59.99,
                videos: [
                    { title: 'Introduction to Networking', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 500 },
                    { title: 'Common Vulnerabilities and Attacks', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 420 },
                    { title: 'Securing Your Systems', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1619161245/samples/elephants.mp4', duration: 210 },
                ]
            }
        ];

        for (const courseData of itCourses) {
            const { videos: videoData, ...courseInfo } = courseData;

            // Create the course
            const course = await Course.create(courseInfo);
            console.log(`Created Course: ${course.title}`);

            const videoIds = [];
            for (const v of videoData) {
                const video = await Video.create({
                    ...v,
                    courseId: course._id
                });
                videoIds.push(video._id);
            }

            // Update course with video references
            course.videos = videoIds;
            await course.save();
            console.log(`Seeded ${videoIds.length} videos for ${course.title}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error.message);
        process.exit(1);
    }
};

seedITCourses();

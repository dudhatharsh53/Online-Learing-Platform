require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const adminEmail = 'admin@example.com';
const adminPassword = 'adminpassword123';
const adminName = 'System Admin';

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log(`User ${adminEmail} already exists. Upgrading to admin...`);
            user.role = 'admin';
            await user.save();
            console.log('User upgraded to admin successfully!');
        } else {
            console.log(`Creating new admin user: ${adminEmail}...`);
            await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully!');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();

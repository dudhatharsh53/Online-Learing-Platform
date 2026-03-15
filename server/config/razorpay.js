const Razorpay = require('razorpay');

let razorpay;

try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    } else {
        console.warn('⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env. Payment features will be disabled.');
    }
} catch (error) {
    console.error('❌ Razorpay initialization error:', error.message);
}

module.exports = razorpay;

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { isStudent } = require('../middleware/roleMiddleware');

router.post('/order/:courseId', protect, isStudent, createOrder);
router.post('/verify', protect, isStudent, verifyPayment);

module.exports = router;

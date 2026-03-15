const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for authenticated users.
 * @param {string} userId - MongoDB user _id
 * @returns {string} signed JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

module.exports = generateToken;

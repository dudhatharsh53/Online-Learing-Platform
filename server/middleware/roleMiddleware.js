/**
 * isAdmin - Middleware to restrict access to admin users only.
 * Must be used AFTER the `protect` middleware.
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};

/**
 * isStudent - Middleware to restrict access to students only.
 * Must be used AFTER the `protect` middleware.
 */
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Students only' });
    }
};

/**
 * isAdminOrStudent - Allow both roles (used for shared routes like progress).
 */
const isAdminOrStudent = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'student')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { isAdmin, isStudent, isAdminOrStudent };

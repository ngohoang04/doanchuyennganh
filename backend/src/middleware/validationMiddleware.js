// src/middleware/validationMiddleware.js

// Validate required fields
const validateFields = (requiredFields) => {
    return (req, res, next) => {
        const missing = [];

        for (let field of requiredFields) {
            if (!req.body[field]) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }

        next();
    };
};

// Validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate password strength
const validatePassword = (password) => {
    return password && password.length >= 6;
};

// Post validation
const validatePost = (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).json({ message: 'Product name is required' });
    }
    if (!req.body.price || isNaN(req.body.price) || req.body.price <= 0) {
        return res.status(400).json({ message: 'Product price must be a positive number' });
    }
    if (!req.body.categoryId || isNaN(req.body.categoryId)) {
        return res.status(400).json({ message: 'Valid categoryId is required' });
    }
    next();
};

// User validation
const validateUser = (req, res, next) => {
    if (!req.body.firstName || req.body.firstName.trim().length === 0) {
        return res.status(400).json({ message: 'First name is required' });
    }
    if (!req.body.lastName || req.body.lastName.trim().length === 0) {
        return res.status(400).json({ message: 'Last name is required' });
    }
    if (!req.body.email || !validateEmail(req.body.email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    next();
};

// Auth validation
const validateRegister = (req, res, next) => {
    if (!req.body.firstName || req.body.firstName.trim().length === 0) {
        return res.status(400).json({ message: 'First name is required' });
    }
    if (!req.body.lastName || req.body.lastName.trim().length === 0) {
        return res.status(400).json({ message: 'Last name is required' });
    }
    if (!req.body.email || !validateEmail(req.body.email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!validatePassword(req.body.password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    next();
};

const validateLogin = (req, res, next) => {
    if (!req.body.email || !validateEmail(req.body.email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!req.body.password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    next();
};

const validateForgotPassword = (req, res, next) => {
    if (!req.body.email || !validateEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
    }
    next();
};

const validateResetPassword = (req, res, next) => {
    if (!req.body.token || String(req.body.token).trim().length === 0) {
        return res.status(400).json({ message: 'Thiếu mã đặt lại mật khẩu' });
    }
    if (!validatePassword(req.body.newPassword)) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    next();
};

module.exports = {
    validateFields,
    validateEmail,
    validatePassword,
    validatePost,
    validateUser,
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
};

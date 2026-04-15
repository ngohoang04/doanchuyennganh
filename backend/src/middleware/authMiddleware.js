// src/config/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 🔐 Middleware bảo vệ route (yêu cầu login)
const protect = async (req, res, next) => {
    let token;

    // Kiểm tra header có Authorization không
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy user từ DB (bỏ password)
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(401).json({
                    message: 'Not authorized, user not found'
                });
            }

            // Gắn user vào request
            req.user = user;

            return next(); // 🔥 cho đi tiếp
        } catch (error) {
            console.error('JWT Error:', error.message);

            return res.status(401).json({
                message: 'Not authorized, token invalid'
            });
        }
    }

    // Không có token
    return res.status(401).json({
        message: 'Not authorized, no token'
    });
};

// 🔐 Middleware phân quyền (role-based)
const authorize = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not allowed`
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorize
};
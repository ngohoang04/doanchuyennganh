const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} = require('../middleware/validationMiddleware');

// REGISTER
router.post('/register', validateRegister, AuthController.register);

// LOGIN
router.post('/login', validateLogin, AuthController.login);

// SOCIAL LOGIN / REGISTER
router.post('/social', AuthController.socialLogin);

// FORGOT / RESET PASSWORD
router.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);
router.post('/reset-password', validateResetPassword, AuthController.resetPassword);

// CHANGE PASSWORD
router.post('/change-password/:id', protect, AuthController.changePassword);

module.exports = router;

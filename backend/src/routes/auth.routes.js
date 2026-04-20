const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// REGISTER
router.post('/register', validateRegister, AuthController.register);

// LOGIN
router.post('/login', validateLogin, AuthController.login);

// CHANGE PASSWORD
router.post('/change-password/:id', protect, AuthController.changePassword);

module.exports = router;

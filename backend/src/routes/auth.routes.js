const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// REGISTER
router.post('/register', validateRegister, AuthController.register);

// LOGIN
router.post('/login', validateLogin, AuthController.login);

module.exports = router;
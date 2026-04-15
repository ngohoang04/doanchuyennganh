const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');

// GET all users (protected)
router.get('/', protect, UserController.getAll);

// GET user by id (protected)
router.get('/:id', protect, UserController.getById);

// CREATE user (protected)
router.post('/', protect, UserController.create);

// UPDATE user (protected)
router.put('/:id', protect, UserController.update);

// DELETE user (protected)
router.delete('/:id', protect, UserController.delete);

module.exports = router;
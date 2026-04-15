const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { protect } = require('../middleware/authMiddleware');

// GET all
router.get('/', CategoryController.getAll);

// GET by id
router.get('/:id', CategoryController.getById);

// CREATE (protected)
router.post('/', protect, CategoryController.create);

// UPDATE (protected)
router.put('/:id', protect, CategoryController.update);

// DELETE (protected)
router.delete('/:id', protect, CategoryController.delete);

module.exports = router;
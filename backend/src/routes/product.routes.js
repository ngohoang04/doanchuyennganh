const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { protect } = require('../middleware/authMiddleware');
const { validatePost } = require('../middleware/validationMiddleware');

// GET all
router.get('/', ProductController.getAll);

// GET by id
router.get('/:id', ProductController.getById);

// CREATE
router.post('/', protect, validatePost, ProductController.create);

// UPDATE
router.put('/:id', protect, ProductController.update);

// DELETE
router.delete('/:id', protect, ProductController.delete);

module.exports = router;
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validatePost } = require('../middleware/validationMiddleware');

// GET all
router.get('/', ProductController.getAll);

// GET mine (seller/admin)
router.get('/seller/mine', protect, authorize('seller', 'admin'), ProductController.getMine);

// GET by id
router.get('/:id', ProductController.getById);

// CREATE (seller/admin)
router.post('/', protect, authorize('seller', 'admin'), validatePost, ProductController.create);

// UPDATE (seller/admin)
router.put('/:id', protect, authorize('seller', 'admin'), ProductController.update);

// DELETE (seller/admin)
router.delete('/:id', protect, authorize('seller', 'admin'), ProductController.delete);

module.exports = router;

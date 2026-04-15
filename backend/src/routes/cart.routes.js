const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { protect } = require('../middleware/authMiddleware');

// GET all carts (protected)
router.get('/', protect, CartController.getAll);

// CREATE cart (protected)
router.post('/', protect, CartController.create);

// ADD to cart (protected) - specific route before generic
router.post('/add', protect, CartController.addToCart);

// UPDATE cart (protected)
router.put('/:id', protect, CartController.update);

// GET cart by userId (protected) - generic route after specific
router.get('/:userId', protect, CartController.getCart);

// REMOVE item from cart (protected)
router.delete('/item/:id', protect, CartController.removeItem);

module.exports = router;
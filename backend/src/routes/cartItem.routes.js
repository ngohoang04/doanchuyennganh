const express = require('express');
const router = express.Router();
const CartItemController = require('../controllers/CartItemController');
const { protect } = require('../middleware/authMiddleware');

// GET all cart items (protected)
router.get('/', protect, CartItemController.getAll);

// CREATE cart item (protected) - specific route before generic
router.post('/', protect, CartItemController.create);

// GET items by cart (protected)
router.get('/cart/:cartId', protect, CartItemController.getByCart);

// Update quantity (protected)
router.put('/:id', protect, CartItemController.updateQuantity);

// Delete item (protected)
router.delete('/:id', protect, CartItemController.delete);

module.exports = router;
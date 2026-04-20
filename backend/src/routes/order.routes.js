const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET all orders (protected)
router.get('/', protect, OrderController.getAll);

// CREATE order (protected)
router.post('/', protect, OrderController.create);

// CHECKOUT (protected) - specific route before generic
router.post('/checkout', protect, OrderController.checkout);

// SELLER ORDERS
router.get('/seller/mine', protect, authorize('seller', 'admin'), OrderController.getSellerOrders);
router.put('/seller/:id/status', protect, authorize('seller', 'admin'), OrderController.updateSellerOrderStatus);

// UPDATE order (protected)
router.put('/:id', protect, OrderController.update);

// GET order by id (protected) - generic route after specific
router.get('/:id', protect, OrderController.getById);

// DELETE order (protected)
router.delete('/:id', protect, OrderController.delete);

module.exports = router;

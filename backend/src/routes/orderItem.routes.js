const express = require('express');
const router = express.Router();
const OrderItemController = require('../controllers/OrderItemController');
const { protect } = require('../middleware/authMiddleware');

// GET items by order (protected)
router.get('/order/:orderId', protect, OrderItemController.getByOrder);

// CREATE order item (protected)
router.post('/', protect, OrderItemController.create);

// DELETE order item (protected)
router.delete('/:id', protect, OrderItemController.delete);

module.exports = router;
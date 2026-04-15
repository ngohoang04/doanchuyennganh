const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { protect } = require('../middleware/authMiddleware');

// GET all reviews
router.get('/', ReviewController.getAll);

// CREATE review (protected)
router.post('/', protect, ReviewController.create);

// GET reviews by product (protected) - specific route before generic
router.get('/product/:productId', ReviewController.getByProduct);

// DELETE review (protected)
router.delete('/:id', protect, ReviewController.delete);

module.exports = router;
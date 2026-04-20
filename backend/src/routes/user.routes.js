const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET all users (admin only)
router.get('/', protect, authorize('admin'), UserController.getAll);

// GET seller requests (admin only)
router.get('/seller-requests/pending', protect, authorize('admin'), UserController.getSellerRequests);

// APPROVE seller request (admin only)
router.post('/seller-requests/:id/approve', protect, authorize('admin'), UserController.approveSellerRequest);

// REJECT seller request (admin only)
router.post('/seller-requests/:id/reject', protect, authorize('admin'), UserController.rejectSellerRequest);

// SUBMIT seller request (protected)
router.post('/:id/seller-request', protect, UserController.submitSellerRequest);

// GET user by id (protected)
router.get('/:id', protect, UserController.getById);

// CREATE user (protected)
router.post('/', protect, UserController.create);

// UPDATE user (protected)
router.put('/:id', protect, UserController.update);

// DELETE user (admin only)
router.delete('/:id', protect, authorize('admin'), UserController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { protect } = require('../middleware/authMiddleware');

// Get conversation (protected)
router.get('/:senderId/:receiverId', protect, MessageController.getConversation);

// Send message (protected)
router.post('/', protect, MessageController.sendMessage);

// Delete message (protected)
router.delete('/:id', protect, MessageController.delete);

module.exports = router;
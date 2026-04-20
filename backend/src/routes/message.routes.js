const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/contacts', protect, MessageController.getContacts);
router.get('/conversation/:userId', protect, MessageController.getConversation);
router.post('/', protect, MessageController.sendMessage);
router.delete('/:id', protect, MessageController.delete);

module.exports = router;

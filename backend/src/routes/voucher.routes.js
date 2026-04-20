const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/available', protect, VoucherController.getAvailable);
router.get('/manage', protect, authorize('admin', 'seller'), VoucherController.getManageList);
router.post('/', protect, authorize('admin', 'seller'), VoucherController.create);
router.put('/:id', protect, authorize('admin', 'seller'), VoucherController.update);
router.delete('/:id', protect, authorize('admin', 'seller'), VoucherController.delete);

module.exports = router;

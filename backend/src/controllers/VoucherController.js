const VoucherService = require('../services/VoucherService');

class VoucherController {
    static async getManageList(req, res) {
        try {
            const vouchers = await VoucherService.getManageList(req.user);
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req, res) {
        try {
            const voucher = await VoucherService.create(req.user, req.body);
            res.status(201).json(voucher);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const voucher = await VoucherService.update(req.user, req.params.id, req.body);
            res.json(voucher);
        } catch (error) {
            const statusCode = error.message === 'Forbidden' ? 403 : 400;
            res.status(statusCode).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await VoucherService.delete(req.user, req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            const statusCode = error.message === 'Forbidden' ? 403 : 404;
            res.status(statusCode).json({ message: error.message });
        }
    }

    static async getAvailable(req, res) {
        try {
            const vouchers = await VoucherService.getAvailableForUser(req.user, req.query.subtotal);
            res.json(vouchers);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = VoucherController;

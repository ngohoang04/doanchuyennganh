const OrderService = require('../services/OrderService');

class OrderController {

    static async getAll(req, res) {
        try {
            const orders = await OrderService.getAll();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const order = await OrderService.getById(req.params.id);
            res.json(order);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const order = await OrderService.create(req.body);
            res.status(201).json(order);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async update(req, res) {
        try {
            const order = await OrderService.update(req.params.id, req.body);
            res.json(order);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await OrderService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async checkout(req, res) {
        try {
            const { userId, shippingAddress } = req.body;

            const order = await OrderService.checkout(userId, shippingAddress);

            res.json(order);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = OrderController;
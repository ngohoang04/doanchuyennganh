const OrderItemService = require('../services/OrderItemService');

class OrderItemController {

    static async getByOrder(req, res) {
        try {
            const items = await OrderItemService.getByOrder(req.params.orderId);
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const item = await OrderItemService.create(req.body);
            res.status(201).json(item);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await OrderItemService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = OrderItemController;
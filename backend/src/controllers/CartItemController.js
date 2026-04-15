const CartItemService = require('../services/CartItemService');

class CartItemController {

    static async getAll(req, res) {
        try {
            const items = await CartItemService.getAll();
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getByCart(req, res) {
        try {
            const items = await CartItemService.getByCart(req.params.cartId);
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const item = await CartItemService.create(req.body);
            res.status(201).json(item);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async updateQuantity(req, res) {
        try {
            const { quantity } = req.body;
            const item = await CartItemService.updateQuantity(
                req.params.id,
                quantity
            );
            res.json(item);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await CartItemService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = CartItemController;
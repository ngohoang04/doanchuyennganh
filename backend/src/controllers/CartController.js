const CartService = require('../services/CartService');

class CartController {

    static async getAll(req, res) {
        try {
            const carts = await CartService.getAll();
            res.json(carts);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getCart(req, res) {
        try {
            const cart = await CartService.getCart(req.params.userId);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const cart = await CartService.create(req.body);
            res.status(201).json(cart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async update(req, res) {
        try {
            const cart = await CartService.update(req.params.id, req.body);
            res.json(cart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async addToCart(req, res) {
        try {
            const { userId, productId, quantity } = req.body;
            const item = await CartService.addToCart(userId, productId, quantity);
            res.json(item);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async removeItem(req, res) {
        try {
            await CartService.removeItem(req.params.id);
            res.json({ message: 'Removed' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = CartController;
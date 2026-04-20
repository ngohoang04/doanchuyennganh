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
            if (String(req.user.id) !== String(req.params.userId) && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden' });
            }
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
            const { productId, quantity } = req.body;
            const cart = await CartService.addToCart(req.user.id, productId, quantity);
            res.json(cart);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async removeItem(req, res) {
        try {
            await CartService.removeItem(req.user.id, req.params.id);
            res.json({ message: 'Removed' });
        } catch (err) {
            const statusCode = err.message === 'Forbidden' ? 403 : 404;
            res.status(statusCode).json({ message: err.message });
        }
    }
}

module.exports = CartController;

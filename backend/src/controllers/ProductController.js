const ProductService = require('../services/ProductService');

class ProductController {

    static async getAll(req, res) {
        try {
            const products = await ProductService.getAll();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const product = await ProductService.getById(req.params.id);
            res.json(product);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async getMine(req, res) {
        try {
            const products = await ProductService.getMine(req.user);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req, res) {
        try {
            const product = await ProductService.createForActor(req.user, req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const product = await ProductService.updateForActor(req.user, req.params.id, req.body);
            res.json(product);
        } catch (error) {
            const statusCode = error.message === 'Forbidden' ? 403 : 404;
            res.status(statusCode).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await ProductService.deleteForActor(req.user, req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            const statusCode = error.message === 'Forbidden' ? 403 : 404;
            res.status(statusCode).json({ message: error.message });
        }
    }
}

module.exports = ProductController;

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

    static async create(req, res) {
        try {
            const product = await ProductService.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const product = await ProductService.update(req.params.id, req.body);
            res.json(product);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await ProductService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = ProductController;
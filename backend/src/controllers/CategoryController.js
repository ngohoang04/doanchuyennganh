const CategoryService = require('../services/CategoryService');

class CategoryController {

    static async getAll(req, res) {
        try {
            const categories = await CategoryService.getAll();
            res.json(categories);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const category = await CategoryService.getById(req.params.id);
            res.json(category);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const category = await CategoryService.create(req.body);
            res.status(201).json(category);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async update(req, res) {
        try {
            const category = await CategoryService.update(req.params.id, req.body);
            res.json(category);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await CategoryService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = CategoryController;

const ReviewService = require('../services/ReviewService');

class ReviewController {

    static async getAll(req, res) {
        try {
            const reviews = await ReviewService.getAll();
            res.json(reviews);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getByProduct(req, res) {
        try {
            const reviews = await ReviewService.getByProduct(req.params.productId);
            res.json(reviews);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const review = await ReviewService.create(req.body);
            res.status(201).json(review);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await ReviewService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = ReviewController;
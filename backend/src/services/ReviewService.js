const { Review, User, Product } = require('../models');

class ReviewService {

    static async getAll() {
        return await Review.findAll({
            include: [
                { model: User, as: 'user' },
                { model: Product, as: 'product' }
            ]
        });
    }

    static async getByProduct(productId) {
        return await Review.findAll({
            where: { productId },
            include: [{ model: User, as: 'user' }]
        });
    }

    static async create(data) {
        return await Review.create(data);
    }

    static async delete(id) {
        const review = await Review.findByPk(id);

        if (!review) {
            throw new Error('Review not found');
        }

        await review.destroy();
        return true;
    }
}

module.exports = ReviewService;
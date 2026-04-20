const { Review, User, Product, Order, OrderItem } = require('../models');

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
            include: [{ model: User, as: 'user' }],
            order: [['createdAt', 'DESC']]
        });
    }

    static async getReviewEligibility(currentUser, productId) {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const existingReview = await Review.findOne({
            where: {
                userId: currentUser.id,
                productId
            }
        });

        const purchasedItem = await OrderItem.findOne({
            where: { productId },
            include: [{
                model: Order,
                as: 'order',
                where: {
                    userId: currentUser.id,
                    status: 'completed'
                },
                required: true
            }]
        });

        const hasPurchased = Boolean(purchasedItem);
        const hasReviewed = Boolean(existingReview);
        const canReview = hasPurchased && !hasReviewed;

        return {
            hasPurchased,
            hasReviewed,
            canReview,
            message: canReview
                ? 'Ban co the danh gia san pham nay'
                : hasReviewed
                    ? 'Ban da danh gia san pham nay roi'
                    : 'Ban chi co the danh gia sau khi don hang da hoan thanh',
            reviewId: existingReview?.id || null
        };
    }

    static async create(currentUser, data) {
        const productId = Number(data.productId);
        const rating = Number(data.rating);
        const comment = String(data.comment || '').trim();

        if (!productId) {
            throw new Error('Product is required');
        }

        if (!rating || rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        if (!comment) {
            throw new Error('Comment is required');
        }

        const eligibility = await this.getReviewEligibility(currentUser, productId);
        if (!eligibility.canReview) {
            throw new Error(eligibility.message);
        }

        return Review.create({
            userId: currentUser.id,
            productId,
            rating,
            comment
        });
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

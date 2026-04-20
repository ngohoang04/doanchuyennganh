const { Op } = require('sequelize');
const { Product, Category, User, Review, OrderItem, Order } = require('../models');

class ProductService {
    static includeWithStats() {
        return [
            { model: Category, as: 'category' },
            { model: User, as: 'seller' },
            { model: Review, as: 'reviews', attributes: ['id', 'rating'] },
            {
                model: OrderItem,
                as: 'orderItems',
                attributes: ['id', 'quantity'],
                include: [{
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'status'],
                    where: {
                        status: {
                            [Op.notIn]: ['cancelled', 'returned']
                        }
                    },
                    required: false
                }]
            }
        ];
    }

    static attachStats(product) {
        const plainProduct = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
        const soldCount = Array.isArray(plainProduct.orderItems)
            ? plainProduct.orderItems.reduce((sum, item) => {
                if (!item.order) return sum;
                return sum + Number(item.quantity || 0);
            }, 0)
            : 0;
        const reviewCount = Array.isArray(plainProduct.reviews) ? plainProduct.reviews.length : 0;
        const averageRating = reviewCount > 0
            ? plainProduct.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
            : 0;

        return {
            ...plainProduct,
            soldCount,
            reviewCount,
            averageRating: Number(averageRating.toFixed(1))
        };
    }

    static normalizeImagePayload(data) {
        const payload = { ...data };
        const images = Array.isArray(payload.images)
            ? payload.images.filter(Boolean)
            : [];

        if (images.length > 0) {
            payload.image = images;
        } else if (payload.image) {
            payload.image = [payload.image];
        }

        return payload;
    }

    static async getAll() {
        const products = await Product.findAll({
            include: this.includeWithStats()
        });

        return products.map((product) => this.attachStats(product));
    }

    static async getById(id) {
        const product = await Product.findByPk(id, {
            include: this.includeWithStats()
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return this.attachStats(product);
    }

    static async getMine(currentUser) {
        const where = currentUser.role === 'admin' ? {} : { sellerId: currentUser.id };
        const products = await Product.findAll({
            where,
            include: this.includeWithStats()
        });

        return products.map((product) => this.attachStats(product));
    }

    static async create(data) {
        return await Product.create(data);
    }

    static async createForActor(currentUser, data) {
        const payload = {
            ...ProductService.normalizeImagePayload(data),
            sellerId: currentUser.role === 'admin' && data.sellerId ? data.sellerId : currentUser.id
        };
        return await Product.create(payload);
    }

    static async update(id, data) {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        await product.update(data);
        return product;
    }

    static async updateForActor(currentUser, id, data) {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        if (currentUser.role !== 'admin' && String(product.sellerId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
        }

        const payload = ProductService.normalizeImagePayload(data);
        if (currentUser.role !== 'admin') {
            delete payload.sellerId;
        }

        await product.update(payload);
        return product;
    }

    static async delete(id) {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        await product.destroy();
        return true;
    }

    static async deleteForActor(currentUser, id) {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        if (currentUser.role !== 'admin' && String(product.sellerId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
        }

        await product.destroy();
        return true;
    }
}

module.exports = ProductService;

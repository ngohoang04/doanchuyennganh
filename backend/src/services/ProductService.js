const { Product, Category, User } = require('../models');

class ProductService {
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
        return await Product.findAll({
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'seller' }
            ]
        });
    }

    static async getById(id) {
        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'seller' }
            ]
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }

    static async getMine(currentUser) {
        const where = currentUser.role === 'admin' ? {} : { sellerId: currentUser.id };
        return await Product.findAll({
            where,
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'seller' }
            ]
        });
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

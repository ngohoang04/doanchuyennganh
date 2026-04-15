const { Product, Category, User } = require('../models');

class ProductService {

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

    static async create(data) {
        return await Product.create(data);
    }

    static async update(id, data) {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        await product.update(data);
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
}

module.exports = ProductService;
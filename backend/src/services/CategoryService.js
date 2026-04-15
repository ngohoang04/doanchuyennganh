const { Category, Product } = require('../models');

class CategoryService {

    static async getAll() {
        return await Category.findAll();
    }

    static async getById(id) {
        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'products'
                }
            ]
        });

        if (!category) {
            throw new Error('Category not found');
        }

        return category;
    }

    static async create(data) {
        return await Category.create(data);
    }

    static async update(id, data) {
        const category = await Category.findByPk(id);

        if (!category) {
            throw new Error('Category not found');
        }

        await category.update(data);
        return category;
    }

    static async delete(id) {
        const category = await Category.findByPk(id);

        if (!category) {
            throw new Error('Category not found');
        }

        await category.destroy();
        return true;
    }
}

module.exports = CategoryService;
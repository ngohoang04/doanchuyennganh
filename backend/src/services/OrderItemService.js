const { OrderItem, Product } = require('../models');

class OrderItemService {

    static async getByOrder(orderId) {
        return await OrderItem.findAll({
            where: { orderId },
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        });
    }

    static async create(data) {
        return await OrderItem.create(data);
    }

    static async delete(id) {
        const item = await OrderItem.findByPk(id);

        if (!item) {
            throw new Error('OrderItem not found');
        }

        await item.destroy();
        return true;
    }
}

module.exports = OrderItemService;
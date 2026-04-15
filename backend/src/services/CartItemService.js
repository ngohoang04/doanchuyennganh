const { CartItem, Product } = require('../models');

class CartItemService {

    // Lấy tất cả cart items
    static async getAll() {
        return await CartItem.findAll({
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        });
    }

    // Lấy tất cả item trong cart
    static async getByCart(cartId) {
        return await CartItem.findAll({
            where: { cartId },
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ]
        });
    }

    // Tạo item
    static async create(data) {
        return await CartItem.create(data);
    }

    // Cập nhật số lượng
    static async updateQuantity(id, quantity) {
        const item = await CartItem.findByPk(id);

        if (!item) {
            throw new Error('CartItem not found');
        }

        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        item.quantity = quantity;
        await item.save();

        return item;
    }

    // Xóa item
    static async delete(id) {
        const item = await CartItem.findByPk(id);

        if (!item) {
            throw new Error('CartItem not found');
        }

        await item.destroy();
        return true;
    }
}

module.exports = CartItemService;
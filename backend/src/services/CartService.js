const { Cart, CartItem } = require('../models');

class CartService {

    static async getAll() {
        return await Cart.findAll({
            include: {
                model: CartItem,
                as: 'items'
            }
        });
    }

    static async getCart(userId) {
        return await Cart.findOne({
            where: { userId },
            include: {
                model: CartItem,
                as: 'items'
            }
        });
    }

    static async create(data) {
        return await Cart.create(data);
    }

    static async update(id, data) {
        const cart = await Cart.findByPk(id);

        if (!cart) {
            throw new Error('Cart not found');
        }

        await cart.update(data);
        return cart;
    }

    static async addToCart(userId, productId, quantity) {
        let cart = await Cart.findOne({ where: { userId } });

        if (!cart) {
            cart = await Cart.create({ userId });
        }

        let item = await CartItem.findOne({
            where: { cartId: cart.id, productId }
        });

        if (item) {
            item.quantity += quantity;
            await item.save();
        } else {
            item = await CartItem.create({
                cartId: cart.id,
                productId,
                quantity
            });
        }

        return item;
    }

    static async removeItem(cartItemId) {
        const item = await CartItem.findByPk(cartItemId);
        if (!item) throw new Error('Item not found');

        await item.destroy();
        return true;
    }
}

module.exports = CartService;
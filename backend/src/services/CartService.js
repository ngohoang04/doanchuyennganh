const { Cart, CartItem, Product, User } = require('../models');

class CartService {
    static buildCartInclude() {
        return [
            {
                model: CartItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{
                        model: User,
                        as: 'seller',
                        attributes: ['id', 'firstName', 'lastName', 'shopName', 'bankAccount', 'bankQrImage']
                    }]
                }]
            }
        ];
    }

    static async getAll() {
        return await Cart.findAll({
            include: this.buildCartInclude()
        });
    }

    static async getCart(userId) {
        let cart = await Cart.findOne({
            where: { userId },
            include: this.buildCartInclude()
        });

        if (!cart) {
            cart = await Cart.create({ userId });
            cart = await Cart.findByPk(cart.id, {
                include: this.buildCartInclude()
            });
        }

        return cart;
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
        const normalizedQuantity = Number(quantity) || 1;
        if (normalizedQuantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (String(product.sellerId) === String(userId)) {
            throw new Error('Bạn không thể mua sản phẩm của chính mình');
        }

        let cart = await Cart.findOne({ where: { userId } });

        if (!cart) {
            cart = await Cart.create({ userId });
        }

        let item = await CartItem.findOne({
            where: { cartId: cart.id, productId }
        });

        if (item) {
            item.quantity += normalizedQuantity;
            await item.save();
        } else {
            item = await CartItem.create({
                cartId: cart.id,
                productId,
                quantity: normalizedQuantity
            });
        }

        return await this.getCart(userId);
    }

    static async removeItem(userId, cartItemId) {
        const item = await CartItem.findByPk(cartItemId);
        if (!item) throw new Error('Item not found');

        const cart = await Cart.findByPk(item.cartId);
        if (!cart || String(cart.userId) !== String(userId)) {
            throw new Error('Forbidden');
        }

        await item.destroy();
        return true;
    }
}

module.exports = CartService;

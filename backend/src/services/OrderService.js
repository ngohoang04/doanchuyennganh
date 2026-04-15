const { Order, OrderItem, Cart, CartItem, Product } = require('../models');

class OrderService {

    static async getAll() {
        return await Order.findAll({
            include: [
                { model: OrderItem, as: 'orderItems' }
            ]
        });
    }

    static async getById(id) {
        const order = await Order.findByPk(id, {
            include: [
                { model: OrderItem, as: 'orderItems' }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    static async create(data) {
        return await Order.create(data);
    }

    static async update(id, data) {
        const order = await Order.findByPk(id);

        if (!order) {
            throw new Error('Order not found');
        }

        await order.update(data);
        return order;
    }

    static async delete(id) {
        const order = await Order.findByPk(id);

        if (!order) {
            throw new Error('Order not found');
        }

        await order.destroy();
        return true;
    }

    static async checkout(userId, shippingAddress) {
        const cart = await Cart.findOne({
            where: { userId },
            include: { model: CartItem, as: 'items' }
        });

        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        let total = 0;

        for (let item of cart.items) {
            const product = await Product.findByPk(item.productId);
            total += product.price * item.quantity;
        }

        const order = await Order.create({
            userId,
            totalAmount: total,
            shippingAddress,
            status: 'pending'
        });

        for (let item of cart.items) {
            const product = await Product.findByPk(item.productId);

            await OrderItem.create({
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // clear cart
        await CartItem.destroy({ where: { cartId: cart.id } });

        return order;
    }
}

module.exports = OrderService;
const { Order, OrderItem, Cart, CartItem, Product, User } = require('../models');
const VoucherService = require('./VoucherService');

class OrderService {
    static async restoreStockForOrderItems(orderItems = []) {
        for (const item of orderItems) {
            const product = item.product || await Product.findByPk(item.productId);
            if (!product) continue;
            product.stock = Number(product.stock || 0) + Number(item.quantity || 0);
            await product.save();
        }
    }

    static async getAll(currentUser) {
        const where = currentUser?.role === 'admin' ? {} : { userId: currentUser.id };
        return await Order.findAll({
            where,
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });
    }

    static async getById(currentUser, id) {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (currentUser.role !== 'admin' && String(order.userId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
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

    static async checkout(userId, shippingAddress, options = {}) {
        const cart = await Cart.findOne({
            where: { userId },
            include: {
                model: CartItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            }
        });

        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        let total = 0;

        for (const item of cart.items) {
            const product = item.product || await Product.findByPk(item.productId);
            if (!product) {
                throw new Error('Product not found');
            }
            if (product.stock < item.quantity) {
                throw new Error(`Product '${product.name}' does not have enough stock`);
            }
            total += Number(product.price) * item.quantity;
        }

        const shippingFee = Number(options.shippingFee || 0);
        const { discountAmount } = await VoucherService.validateCodeForCheckout(
            { id: userId },
            options.voucherCode,
            total,
            shippingFee
        );
        const normalizedPaymentMethod = String(options.paymentMethod || '').toLowerCase();
        const paymentStatus = normalizedPaymentMethod.includes('chuyen khoan')
            ? 'awaiting_transfer'
            : 'pending';

        const order = await Order.create({
            userId,
            totalAmount: Math.max(total + shippingFee - discountAmount, 0),
            shippingAddress,
            status: 'pending',
            paymentStatus
        });

        for (const item of cart.items) {
            const product = item.product || await Product.findByPk(item.productId);

            await OrderItem.create({
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });

            product.stock -= item.quantity;
            await product.save();
        }

        // clear cart
        await CartItem.destroy({ where: { cartId: cart.id } });

        return await this.getById({ id: userId, role: 'user' }, order.id);
    }

    static async getSellerOrders(currentUser) {
        const orderItems = await OrderItem.findAll({
            include: [
                {
                    model: Order,
                    as: 'order',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phone'] }]
                },
                {
                    model: Product,
                    as: 'product',
                    where: { sellerId: currentUser.id }
                }
            ]
        });

        const grouped = new Map();

        for (const item of orderItems) {
            const order = item.order;
            if (!grouped.has(order.id)) {
                grouped.set(order.id, {
                    id: order.id,
                    userId: order.userId,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    shippingAddress: order.shippingAddress,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    user: order.user,
                    orderItems: []
                });
            }

            grouped.get(order.id).orderItems.push(item);
        }

        return Array.from(grouped.values());
    }

    static async updateSellerOrderStatus(currentUser, orderId, status) {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        const items = order.orderItems || [];
        if (!items.length) {
            throw new Error('Order has no items');
        }

        const allOwnedBySeller = items.every(
            (item) => item.product && String(item.product.sellerId) === String(currentUser.id)
        );

        if (!allOwnedBySeller) {
            throw new Error('Forbidden');
        }

        const nextStatus = String(status || '').toLowerCase();
        const currentStatus = String(order.status || '').toLowerCase();
        const allowedStatuses = ['confirmed', 'shipping', 'completed', 'returned'];

        if (!allowedStatuses.includes(nextStatus)) {
            throw new Error('Invalid order status');
        }

        if (currentStatus === 'cancelled') {
            throw new Error('Cancelled order cannot be updated');
        }

        if (currentStatus === 'returned' && nextStatus !== 'returned') {
            throw new Error('Returned order cannot be updated');
        }

        if (nextStatus === 'returned' && currentStatus !== 'returned') {
            await this.restoreStockForOrderItems(items);
        }

        await order.update({
            status: nextStatus,
            paymentStatus: nextStatus === 'returned' ? 'returned' : order.paymentStatus
        });

        return this.getById({ id: order.userId, role: 'user' }, order.id);
    }

    static async cancelByUser(currentUser, orderId) {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (currentUser.role !== 'admin' && String(order.userId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
        }

        if (!['pending', 'confirmed'].includes(String(order.status || '').toLowerCase())) {
            throw new Error('Order cannot be cancelled');
        }

        await this.restoreStockForOrderItems(order.orderItems || []);

        await order.update({
            status: 'cancelled',
            paymentStatus: 'cancelled'
        });

        return this.getById(currentUser, orderId);
    }

    static async returnByUser(currentUser, orderId) {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (currentUser.role !== 'admin' && String(order.userId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
        }

        if (String(order.status || '').toLowerCase() !== 'completed') {
            throw new Error('Order cannot be returned');
        }

        await this.restoreStockForOrderItems(order.orderItems || []);

        await order.update({
            status: 'returned',
            paymentStatus: 'returned'
        });

        return this.getById(currentUser, orderId);
    }
}

module.exports = OrderService;

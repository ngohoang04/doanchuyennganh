const { Op } = require('sequelize');
const { Voucher, Cart, CartItem, Product, User } = require('../models');

class VoucherService {
    static async ensureTable() {
        if (!VoucherService.syncPromise) {
            VoucherService.syncPromise = Voucher.sync().catch((error) => {
                VoucherService.syncPromise = null;
                throw error;
            });
        }

        await VoucherService.syncPromise;
    }

    static normalizePayload(data, currentUser) {
        return {
            code: String(data.code || '').trim().toUpperCase(),
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim() || null,
            discountType: data.discountType,
            discountValue: Number(data.discountValue || 0),
            minOrderValue: Number(data.minOrderValue || 0),
            maxDiscount: data.maxDiscount !== '' && data.maxDiscount != null ? Number(data.maxDiscount) : null,
            shippingDiscount: Number(data.shippingDiscount || 0),
            ownerId: currentUser.id,
            ownerRole: currentUser.role,
            isActive: data.isActive !== false,
            startsAt: data.startsAt || null,
            endsAt: data.endsAt || null
        };
    }

    static async getManageList(currentUser) {
        await this.ensureTable();
        const where = currentUser.role === 'admin' ? {} : { ownerId: currentUser.id };
        return Voucher.findAll({
            where,
            include: [{ model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
            order: [['createdAt', 'DESC']]
        });
    }

    static async create(currentUser, data) {
        await this.ensureTable();
        const payload = this.normalizePayload(data, currentUser);
        if (!payload.code || !payload.name || !payload.discountType) {
            throw new Error('Missing required voucher fields');
        }
        const existing = await Voucher.findOne({ where: { code: payload.code } });
        if (existing) {
            throw new Error('Voucher code already exists');
        }
        return Voucher.create(payload);
    }

    static async update(currentUser, id, data) {
        await this.ensureTable();
        const voucher = await Voucher.findByPk(id);
        if (!voucher) throw new Error('Voucher not found');
        if (currentUser.role !== 'admin' && String(voucher.ownerId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
        }
        const payload = this.normalizePayload({ ...voucher.toJSON(), ...data }, currentUser);
        payload.ownerId = voucher.ownerId;
        payload.ownerRole = voucher.ownerRole;
        if (payload.code !== voucher.code) {
            const existing = await Voucher.findOne({ where: { code: payload.code, id: { [Op.ne]: voucher.id } } });
            if (existing) throw new Error('Voucher code already exists');
        }
        await voucher.update(payload);
        return voucher;
    }

    static async delete(currentUser, id) {
        await this.ensureTable();
        const voucher = await Voucher.findByPk(id);
        if (!voucher) throw new Error('Voucher not found');
        if (currentUser.role !== 'admin' && String(voucher.ownerId) !== String(currentUser.id)) {
            throw new Error('Forbidden');
        }
        await voucher.destroy();
        return true;
    }

    static async getCartContext(userId) {
        const cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            }]
        });
        const items = cart?.items || [];
        const subtotal = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0);
        const sellerIds = [...new Set(items.map((item) => item.product?.sellerId).filter(Boolean).map(String))];
        return { items, subtotal, sellerIds };
    }

    static calculateDiscount(voucher, subtotal, shippingFee = 0) {
        let discountAmount = 0;
        if (voucher.discountType === 'fixed') {
            discountAmount += Number(voucher.discountValue || 0);
        }
        if (voucher.discountType === 'percent') {
            discountAmount += subtotal * (Number(voucher.discountValue || 0) / 100);
        }
        if (voucher.maxDiscount) {
            discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
        }
        if (voucher.shippingDiscount) {
            discountAmount += Math.min(Number(voucher.shippingDiscount), Number(shippingFee || 0));
        }
        return Math.max(discountAmount, 0);
    }

    static async getAvailableForUser(currentUser, subtotal = null) {
        await this.ensureTable();
        const cartContext = await this.getCartContext(currentUser.id);
        const effectiveSubtotal = subtotal != null ? Number(subtotal) : cartContext.subtotal;
        const now = new Date();
        const vouchers = await Voucher.findAll({
            where: {
                isActive: true,
                [Op.and]: [
                    { [Op.or]: [{ startsAt: null }, { startsAt: { [Op.lte]: now } }] },
                    { [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gte]: now } }] }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        return vouchers.filter((voucher) => {
            if (effectiveSubtotal < Number(voucher.minOrderValue || 0)) return false;
            if (voucher.ownerRole === 'admin') return true;
            return cartContext.sellerIds.length === 1 && cartContext.sellerIds[0] === String(voucher.ownerId);
        });
    }

    static async validateCodeForCheckout(currentUser, code, subtotal, shippingFee = 0) {
        if (!code) {
            return { voucher: null, discountAmount: 0 };
        }

        const vouchers = await this.getAvailableForUser(currentUser, subtotal);
        const voucher = vouchers.find((item) => item.code === String(code).trim().toUpperCase());
        if (!voucher) {
            throw new Error('Voucher is invalid or not applicable');
        }

        return {
            voucher,
            discountAmount: this.calculateDiscount(voucher, Number(subtotal || 0), Number(shippingFee || 0))
        };
    }
}

VoucherService.syncPromise = null;

module.exports = VoucherService;

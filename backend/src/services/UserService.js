const { User } = require('../models');

class UserService {
    static isMissingSellerDetailColumnError(error) {
        const message = error?.message || '';
        return /unknown column/i.test(message) && /(shop_|id_card_|business_license|bank_account|bank_qr_image)/i.test(message);
    }

    static async getAll() {
        return await User.findAll();
    }

    static async getSellerRequests() {
        return await User.findAll({
            where: { sellerStatus: 'pending' }
        });
    }

    static async approveSellerRequest(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.sellerStatus !== 'pending') {
            throw new Error('This user does not have a pending seller request');
        }

        await user.update({ sellerStatus: 'active', role: 'seller' });
        return user;
    }

    static async rejectSellerRequest(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.sellerStatus !== 'pending') {
            throw new Error('This user does not have a pending seller request');
        }

        await user.update({ sellerStatus: 'rejected' });
        return user;
    }

    static async submitSellerRequest(currentUser, targetUserId, data) {
        if (!currentUser || (String(currentUser.id) !== String(targetUserId) && currentUser.role !== 'admin')) {
            throw new Error('Forbidden');
        }

        const user = await User.findByPk(targetUserId);

        if (!user) {
            throw new Error('User not found');
        }

        const sellerPayload = {
            sellerStatus: 'pending',
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            shopName: data.shopName,
            shopDescription: data.shopDescription,
            shopAddress: data.shopAddress,
            idCardNumber: data.idCardNumber,
            idCardFront: data.idCardFront,
            idCardBack: data.idCardBack,
            businessLicense: data.businessLicense,
            bankAccount: data.bankAccount,
            bankQrImage: data.bankQrImage,
            shopLogo: data.shopLogo
        };

        try {
            await user.update(sellerPayload);
        } catch (error) {
            if (!UserService.isMissingSellerDetailColumnError(error)) {
                throw error;
            }

            // Fallback for databases that have sellerStatus but have not run the seller detail migration yet.
            await user.update({ sellerStatus: 'pending' });
        }

        return user;
    }

    static async getById(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    static async create(data) {
        // BTL: để đơn giản (không hash password)
        return await User.create(data);
    }

    static async update(id, data) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        await user.update(data);
        return user;
    }

    static async delete(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        await user.destroy();
        return true;
    }
}

module.exports = UserService;

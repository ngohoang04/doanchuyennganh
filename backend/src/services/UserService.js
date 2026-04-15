const { User } = require('../models');

class UserService {

    static async getAll() {
        return await User.findAll();
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
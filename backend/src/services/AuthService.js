const { User } = require('../models');
const bcrypt = require('bcryptjs');

class AuthService {

    // REGISTER
    static async register(data) {
        const { email, password, phone, firstName, lastName, avatar } = data;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const generatedUsername =
            (lastName && lastName.trim()) ||
            (firstName && firstName.trim()) ||
            email.split('@')[0] ||
            `user_${Date.now()}`;

        const user = await User.create({
            username: generatedUsername,
            email,
            password: hashedPassword,
            phone: phone || null,
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            avatar: avatar || null
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    // LOGIN
    static async login(email, password) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    static async changePassword(currentUser, targetUserId, oldPassword, newPassword) {
        if (!currentUser || (String(currentUser.id) !== String(targetUserId) && currentUser.role !== 'admin')) {
            throw new Error('Forbidden');
        }

        const user = await User.findByPk(targetUserId);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        if (!newPassword || newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: 'Password changed successfully' };
    }
}

module.exports = AuthService;

const { User } = require('../models');
const bcrypt = require('bcryptjs');

class AuthService {

    // REGISTER
    static async register(data) {
        const { username, email, password } = data;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        return user;
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

        return user;
    }
}

module.exports = AuthService;
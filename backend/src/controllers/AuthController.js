const AuthService = require('../services/AuthService');
const generateToken = require('../utils/generateToken');

class AuthController {

    // REGISTER
    static async register(req, res) {
        try {
            const user = await AuthService.register(req.body);

            res.status(201).json({
                user,
                token: generateToken(user.id)
            });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    // LOGIN
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await AuthService.login(email, password);

            res.json({
                user,
                token: generateToken(user.id)
            });
        } catch (err) {
            res.status(401).json({ message: err.message });
        }
    }
}

module.exports = AuthController;
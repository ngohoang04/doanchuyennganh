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
            res.status(400).json({ message: err.message });
        }
    }

    static async socialLogin(req, res) {
        try {
            const { provider, accessToken } = req.body;
            const user = await AuthService.socialLogin(provider, accessToken);

            res.json({
                user,
                token: generateToken(user.id)
            });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const result = await AuthService.changePassword(
                req.user,
                req.params.id,
                req.body.oldPassword,
                req.body.newPassword
            );

            res.json(result);
        } catch (err) {
            const statusCode = err.message === 'Forbidden' ? 403 : 400;
            res.status(statusCode).json({ message: err.message });
        }
    }
}

module.exports = AuthController;

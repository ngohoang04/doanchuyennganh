const UserService = require('../services/UserService');

class UserController {

    static async getAll(req, res) {
        try {
            const users = await UserService.getAll();
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getSellerRequests(req, res) {
        try {
            const requests = await UserService.getSellerRequests();
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async approveSellerRequest(req, res) {
        try {
            const user = await UserService.approveSellerRequest(req.params.id);
            res.json({ message: 'Seller request approved', user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async rejectSellerRequest(req, res) {
        try {
            const user = await UserService.rejectSellerRequest(req.params.id);
            res.json({ message: 'Seller request rejected', user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async submitSellerRequest(req, res) {
        try {
            const user = await UserService.submitSellerRequest(req.user, req.params.id, req.body);
            const { password, ...userWithoutPassword } = user.toJSON ? user.toJSON() : user;
            res.json({
                message: 'Seller request submitted successfully',
                user: userWithoutPassword
            });
        } catch (err) {
            const statusCode = err.message === 'Forbidden' ? 403 : 400;
            res.status(statusCode).json({
                message: err.message || 'Failed to submit seller request'
            });
        }
    }

    static async getById(req, res) {
        try {
            const user = await UserService.getById(req.params.id);
            res.json(user);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const user = await UserService.create(req.body);
            res.status(201).json(user);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async update(req, res) {
        try {
            if (String(req.user.id) !== String(req.params.id) && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden' });
            }
            const user = await UserService.update(req.params.id, req.body);
            const { password, ...userWithoutPassword } = user.toJSON ? user.toJSON() : user;
            res.json({ user: userWithoutPassword });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await UserService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = UserController;

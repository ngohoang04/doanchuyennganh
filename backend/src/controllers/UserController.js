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
            const user = await UserService.update(req.params.id, req.body);
            res.json(user);
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

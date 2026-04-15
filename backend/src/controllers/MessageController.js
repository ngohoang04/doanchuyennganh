const MessageService = require('../services/MessageService');

class MessageController {

    static async getConversation(req, res) {
        try {
            const { senderId, receiverId } = req.params;

            const messages = await MessageService.getConversation(
                senderId,
                receiverId
            );

            res.json(messages);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async sendMessage(req, res) {
        try {
            const message = await MessageService.sendMessage(req.body);
            res.status(201).json(message);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await MessageService.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }
}

module.exports = MessageController;
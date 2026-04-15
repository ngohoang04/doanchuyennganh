const { Message, User } = require('../models');

class MessageService {

    // Lấy tất cả message giữa 2 user
    static async getConversation(senderId, receiverId) {
        return await Message.findAll({
            where: {
                senderId,
                receiverId
            },
            include: [
                { model: User, as: 'sender' },
                { model: User, as: 'receiver' }
            ]
        });
    }

    // Gửi message
    static async sendMessage(data) {
        return await Message.create(data);
    }

    // Xóa message
    static async delete(id) {
        const message = await Message.findByPk(id);

        if (!message) {
            throw new Error('Message not found');
        }

        await message.destroy();
        return true;
    }
}

module.exports = MessageService;
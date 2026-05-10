const { Op } = require('sequelize');
const { Message, User } = require('../models');

class MessageService {
    static userAttributes() {
        return ['id', 'email', 'firstName', 'lastName', 'avatar', 'role', 'shopName', 'shopLogo'];
    }

    static buildMessagePreview(message) {
        return String(message?.content || '').trim() || (message?.image ? 'Đã gửi ảnh' : '');
    }

    static async getContacts(currentUser) {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: currentUser.id },
                    { receiverId: currentUser.id }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: this.userAttributes() },
                { model: User, as: 'receiver', attributes: this.userAttributes() }
            ],
            order: [['createdAt', 'DESC']]
        });

        const contacts = new Map();

        for (const message of messages) {
            const otherUser = String(message.senderId) === String(currentUser.id)
                ? message.receiver
                : message.sender;

            if (!otherUser || contacts.has(String(otherUser.id))) continue;

            contacts.set(String(otherUser.id), {
                id: otherUser.id,
                email: otherUser.email,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                avatar: otherUser.avatar || otherUser.shopLogo || null,
                role: otherUser.role,
                shopName: otherUser.shopName || null,
                lastMessage: this.buildMessagePreview(message),
                lastMessageAt: message.createdAt,
                unreadCount: 0
            });
        }

        for (const message of messages) {
            if (String(message.receiverId) !== String(currentUser.id) || message.isRead) continue;
            const otherUserId = String(message.senderId);
            const contact = contacts.get(otherUserId);
            if (!contact) continue;
            contact.unreadCount = Number(contact.unreadCount || 0) + 1;
        }

        return Array.from(contacts.values());
    }

    static async getConversation(currentUser, otherUserId) {
        if (String(otherUserId) === String(currentUser.id)) {
            throw new Error('Cannot open conversation with yourself');
        }

        await Message.update(
            { isRead: true },
            {
                where: {
                    senderId: otherUserId,
                    receiverId: currentUser.id,
                    isRead: false
                }
            }
        );

        return Message.findAll({
            where: {
                [Op.or]: [
                    {
                        senderId: currentUser.id,
                        receiverId: otherUserId
                    },
                    {
                        senderId: otherUserId,
                        receiverId: currentUser.id
                    }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: this.userAttributes() },
                { model: User, as: 'receiver', attributes: this.userAttributes() }
            ],
            order: [['createdAt', 'ASC']]
        });
    }

    static async sendMessage(currentUser, data) {
        const receiverId = Number(data.receiverId);
        const content = String(data.content || '').trim();
        const image = String(data.image || '').trim();

        if (!receiverId || (!content && !image)) {
            throw new Error('Receiver and content or image are required');
        }

        if (String(receiverId) === String(currentUser.id)) {
            throw new Error('Cannot send message to yourself');
        }

        const receiver = await User.findByPk(receiverId, {
            attributes: this.userAttributes()
        });

        if (!receiver) {
            throw new Error('Receiver not found');
        }

        const message = await Message.create({
            senderId: currentUser.id,
            receiverId,
            content: content || '',
            image: image || null,
            isRead: false
        });

        return Message.findByPk(message.id, {
            include: [
                { model: User, as: 'sender', attributes: this.userAttributes() },
                { model: User, as: 'receiver', attributes: this.userAttributes() }
            ]
        });
    }

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

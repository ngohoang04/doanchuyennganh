'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('123456', 10);

        await queryInterface.bulkInsert('Users', [
            {
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User',
                phone: '0123456789',
                role: 'user',
                sellerStatus: 'none',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                phone: '0987654321',
                role: 'admin',
                sellerStatus: 'none',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Users', null, {});
    }
};

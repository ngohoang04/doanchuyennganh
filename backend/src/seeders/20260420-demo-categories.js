'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('Categories', [
            { name: 'Dien thoai', createdAt: now, updatedAt: now },
            { name: 'Laptop', createdAt: now, updatedAt: now },
            { name: 'Tai nghe', createdAt: now, updatedAt: now },
            { name: 'Phu kien', createdAt: now, updatedAt: now },
            { name: 'Gaming', createdAt: now, updatedAt: now },
            { name: 'Man hinh', createdAt: now, updatedAt: now }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Categories', null, {});
    }
};

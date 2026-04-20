'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('vouchers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            discountType: {
                type: Sequelize.STRING,
                allowNull: false
            },
            discountValue: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            minOrderValue: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            maxDiscount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            shippingDiscount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            ownerId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            ownerRole: {
                type: Sequelize.STRING,
                allowNull: false
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            startsAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            endsAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('vouchers');
    }
};

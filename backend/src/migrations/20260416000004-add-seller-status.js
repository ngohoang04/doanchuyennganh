'use strict';
/** @type {import('sequelize-cli').Migration} */
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await addColumnIfMissing(queryInterface, ['Users', 'users'], 'sellerStatus', {
            type: Sequelize.STRING,
            defaultValue: 'none',
            allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        await removeColumnIfExists(queryInterface, ['Users', 'users'], 'sellerStatus');
    }
};

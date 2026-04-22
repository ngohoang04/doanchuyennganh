'use strict';
/** @type {import('sequelize-cli').Migration} */
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await addColumnIfMissing(queryInterface, ['Users', 'users'], 'phone', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },
    async down(queryInterface, Sequelize) {
        await removeColumnIfExists(queryInterface, ['Users', 'users'], 'phone');
    }
};

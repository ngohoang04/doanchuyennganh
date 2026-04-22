'use strict';
const { changeColumnIfExists } = require('./helpers/schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await changeColumnIfExists(queryInterface, ['Products', 'products'], 'image', {
            type: Sequelize.TEXT('long'),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await changeColumnIfExists(queryInterface, ['Products', 'products'], 'image', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
};

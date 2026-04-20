'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Products', 'image', {
            type: Sequelize.TEXT('long'),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Products', 'image', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
};

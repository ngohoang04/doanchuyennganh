'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'sellerStatus', {
            type: Sequelize.STRING,
            defaultValue: 'none',
            allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'sellerStatus');
    }
};
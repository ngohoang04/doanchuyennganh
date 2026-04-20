'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'avatar', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'avatar');
    }
};

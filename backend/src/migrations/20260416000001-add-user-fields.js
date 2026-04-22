'use strict';
/** @type {import('sequelize-cli').Migration} */
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'firstName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'lastName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'firstName');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'lastName');
  }
};

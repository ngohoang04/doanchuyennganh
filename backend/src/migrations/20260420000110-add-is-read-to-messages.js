'use strict';
/** @type {import('sequelize-cli').Migration} */
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Messages', 'messages'], 'isRead', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await removeColumnIfExists(queryInterface, ['Messages', 'messages'], 'isRead');
  }
};

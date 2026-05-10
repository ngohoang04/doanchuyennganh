'use strict';
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Messages', 'messages'], 'image', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, ['Messages', 'messages'], 'image');
  }
};

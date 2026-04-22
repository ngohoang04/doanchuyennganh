'use strict';
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'bank_qr_image', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'bank_qr_image');
  }
};

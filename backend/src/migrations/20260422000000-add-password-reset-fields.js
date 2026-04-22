'use strict';
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'reset_password_token_hash', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'reset_password_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'reset_password_token_hash');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'reset_password_expires_at');
  }
};

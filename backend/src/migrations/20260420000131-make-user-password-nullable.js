'use strict';
const { changeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};

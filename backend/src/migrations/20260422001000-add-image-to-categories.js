'use strict';
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Categories', 'categories'], 'image', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, ['Categories', 'categories'], 'image');
  }
};

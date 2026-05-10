'use strict';
const { changeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'avatar', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_front', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_back', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'business_license', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'shop_logo', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'avatar', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_front', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_back', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'business_license', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await changeColumnIfExists(queryInterface, ['Users', 'users'], 'shop_logo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};

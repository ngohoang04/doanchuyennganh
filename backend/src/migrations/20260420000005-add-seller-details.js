'use strict';
const { addColumnIfMissing, removeColumnIfExists } = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'shop_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'shop_description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'shop_address', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'id_card_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'id_card_front', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'id_card_back', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'business_license', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'bank_account', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'shop_logo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'shop_name');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'shop_description');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'shop_address');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_number');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_front');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'id_card_back');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'business_license');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'bank_account');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'shop_logo');
  }
};

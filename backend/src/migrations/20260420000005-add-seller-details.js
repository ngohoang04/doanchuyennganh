'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'shop_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'shop_description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'shop_address', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'id_card_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'id_card_front', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'id_card_back', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'business_license', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'bank_account', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'shop_logo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'shop_name');
    await queryInterface.removeColumn('users', 'shop_description');
    await queryInterface.removeColumn('users', 'shop_address');
    await queryInterface.removeColumn('users', 'id_card_number');
    await queryInterface.removeColumn('users', 'id_card_front');
    await queryInterface.removeColumn('users', 'id_card_back');
    await queryInterface.removeColumn('users', 'business_license');
    await queryInterface.removeColumn('users', 'bank_account');
    await queryInterface.removeColumn('users', 'shop_logo');
  }
};

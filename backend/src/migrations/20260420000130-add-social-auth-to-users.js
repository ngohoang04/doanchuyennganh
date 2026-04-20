'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'auth_provider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local'
    });

    await queryInterface.addColumn('Users', 'provider_user_id', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addConstraint('Users', {
      fields: ['auth_provider', 'provider_user_id'],
      type: 'unique',
      name: 'unique_user_social_provider_id'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Users', 'unique_user_social_provider_id');
    await queryInterface.removeColumn('Users', 'provider_user_id');
    await queryInterface.removeColumn('Users', 'auth_provider');
  }
};

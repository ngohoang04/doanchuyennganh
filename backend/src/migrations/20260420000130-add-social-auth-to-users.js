'use strict';
const {
  addColumnIfMissing,
  removeColumnIfExists,
  addConstraintIfMissing,
  removeConstraintIfExists
} = require('./helpers/schema');

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'auth_provider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local'
    });

    await addColumnIfMissing(queryInterface, ['Users', 'users'], 'provider_user_id', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await addConstraintIfMissing(queryInterface, ['Users', 'users'], {
      fields: ['auth_provider', 'provider_user_id'],
      type: 'unique',
      name: 'unique_user_social_provider_id'
    });
  },

  async down(queryInterface) {
    await removeConstraintIfExists(queryInterface, ['Users', 'users'], 'unique_user_social_provider_id');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'provider_user_id');
    await removeColumnIfExists(queryInterface, ['Users', 'users'], 'auth_provider');
  }
};

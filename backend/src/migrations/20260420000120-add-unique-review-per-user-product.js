'use strict';
/** @type {import('sequelize-cli').Migration} */
const { addConstraintIfMissing, removeConstraintIfExists, resolveTable } = require('./helpers/schema');

module.exports = {
  async up(queryInterface) {
    const { tableName } = await resolveTable(queryInterface, ['Reviews', 'reviews']);
    const quotedTable = queryInterface.queryGenerator.quoteTable(tableName);

    await queryInterface.sequelize.query(`
      DELETE r1 FROM ${quotedTable} r1
      INNER JOIN ${quotedTable} r2
        ON r1.userId = r2.userId
       AND r1.productId = r2.productId
       AND r1.id > r2.id
    `);

    await addConstraintIfMissing(queryInterface, ['Reviews', 'reviews'], {
      fields: ['userId', 'productId'],
      type: 'unique',
      name: 'unique_review_per_user_product'
    });
  },

  async down(queryInterface) {
    await removeConstraintIfExists(queryInterface, ['Reviews', 'reviews'], 'unique_review_per_user_product');
  }
};

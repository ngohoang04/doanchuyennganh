'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE r1 FROM Reviews r1
      INNER JOIN Reviews r2
        ON r1.userId = r2.userId
       AND r1.productId = r2.productId
       AND r1.id > r2.id
    `);

    await queryInterface.addConstraint('Reviews', {
      fields: ['userId', 'productId'],
      type: 'unique',
      name: 'unique_review_per_user_product'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Reviews', 'unique_review_per_user_product');
  }
};

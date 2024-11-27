'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'stripeCustomerId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'subscriptionId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'subscriptionStatus', {
      type: Sequelize.ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete'),
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'trialEndsAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'stripeCustomerId');
    await queryInterface.removeColumn('Users', 'subscriptionId');
    
    // Remove ENUM type after removing the column
    await queryInterface.removeColumn('Users', 'subscriptionStatus');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_subscriptionStatus";');
    
    await queryInterface.removeColumn('Users', 'trialEndsAt');
  }
};

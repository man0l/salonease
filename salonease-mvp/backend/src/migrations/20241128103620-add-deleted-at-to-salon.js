'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Salons', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addIndex('Salons', ['deletedAt'], {
      name: 'salons_deleted_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Salons', 'salons_deleted_at');
    await queryInterface.removeColumn('Salons', 'deletedAt');
  }
};
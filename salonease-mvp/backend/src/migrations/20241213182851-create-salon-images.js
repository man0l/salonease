'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SalonImages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      salonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Salons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      caption: {
        type: Sequelize.STRING,
        allowNull: true
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('SalonImages', ['salonId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SalonImages');
  }
};

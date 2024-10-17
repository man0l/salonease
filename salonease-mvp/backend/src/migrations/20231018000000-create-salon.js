'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Salons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Check if the index exists before creating it
    const indices = await queryInterface.showIndex('Salons');
    const indexExists = indices.some(index => index.name === 'salons_owner_id');
    
    if (!indexExists) {
      // Add an index on the ownerId for better query performance
      await queryInterface.addIndex('Salons', ['ownerId'], {
        name: 'salons_owner_id'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Salons');
  }
};

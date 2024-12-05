'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove the existing validation constraint
    await queryInterface.changeColumn('Clients', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isValidPhoneNumber(value) {
          if (value && !/^[+\d]+$/.test(value)) {
            throw new Error('Phone number can only contain digits and + symbol');
          }
        }
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert back to the original validation
    await queryInterface.changeColumn('Clients', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        is: /^[0-9]*$/
      }
    });
  }
};

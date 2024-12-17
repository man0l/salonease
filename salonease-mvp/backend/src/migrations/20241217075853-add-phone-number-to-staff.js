module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Staffs', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        is: /^\+[1-9]\d{1,14}$/ // E.164 format validation
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Staffs', 'phoneNumber');
  }
};
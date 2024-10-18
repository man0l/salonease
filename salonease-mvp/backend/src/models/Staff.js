const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    invitationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Staff.associate = (models) => {
    Staff.belongsTo(models.Salon, {
      foreignKey: 'salonId',
      as: 'salon',
    });
    Staff.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Staff;
};

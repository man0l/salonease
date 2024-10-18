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
    role: {
      type: DataTypes.ENUM('stylist', 'manager'),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

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
      defaultValue: true,
    },
    invitationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\+[1-9]\d{1,14}$/ // E.164 format validation
      }
    }
  }, {
    tableName: 'Staffs'
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

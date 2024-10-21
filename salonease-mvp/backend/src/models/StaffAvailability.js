const { Model, DataTypes } = require('sequelize');

class StaffAvailability extends Model {
  static associate(models) {
    this.belongsTo(models.Staff, { foreignKey: 'staffId', as: 'staff' });
    this.belongsTo(models.Salon, { foreignKey: 'salonId', as: 'salon' });
  }
}

module.exports = (sequelize) => {
  StaffAvailability.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('AVAILABILITY', 'TIME_OFF'),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'StaffAvailability',
    tableName: 'StaffAvailabilities',
    timestamps: true,
  });

  return StaffAvailability;
};

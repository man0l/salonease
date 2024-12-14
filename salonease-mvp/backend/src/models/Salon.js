const { Model, DataTypes } = require('sequelize');

class Salon extends Model {
  static associate(models) {
    this.belongsTo(models.User, { 
      foreignKey: 'ownerId', 
      as: 'owner',
      onDelete: 'CASCADE'
    });
    this.hasMany(models.Staff, { foreignKey: 'salonId', as: 'staff' });
    this.hasMany(models.SalonImage, { foreignKey: 'salonId', as: 'images' });
  }
}

module.exports = (sequelize) => {
  Salon.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Salon',
    paranoid: true,
    timestamps: true
  });

  return Salon;
};

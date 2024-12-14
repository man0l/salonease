const { Model, DataTypes } = require('sequelize');

class SalonImage extends Model {
  static associate(models) {
    this.belongsTo(models.Salon, {
      foreignKey: 'salonId',
      as: 'salon',
      onDelete: 'CASCADE'
    });
  }
}

module.exports = (sequelize) => {
  SalonImage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Salons',
        key: 'id'
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'SalonImage',
    tableName: 'SalonImages',
    timestamps: true
  });

  return SalonImage;
}; 
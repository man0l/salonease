const { Model, DataTypes } = require('sequelize');

class Salon extends Model {
  static associate(models) {
    // define associations here
    this.belongsTo(models.User, { 
      foreignKey: 'ownerId', 
      as: 'owner',
      onDelete: 'CASCADE'
    });
  }
}

module.exports = (sequelize) => {
  Salon.init({
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Salon',
  });

  return Salon;
};

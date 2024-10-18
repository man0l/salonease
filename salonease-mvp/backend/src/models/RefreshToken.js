const { Model, DataTypes } = require('sequelize');

class RefreshToken extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = (sequelize) => {
  RefreshToken.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'RefreshToken',
  });

  return RefreshToken;
};

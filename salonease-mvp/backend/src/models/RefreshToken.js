const { Model, DataTypes } = require('sequelize');

class RefreshToken extends Model {
  static associate(models) {
    // define associations here
    this.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = (sequelize) => {
  RefreshToken.init({
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
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

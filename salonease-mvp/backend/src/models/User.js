const { Model, DataTypes } = require('sequelize');
const ROLES = require('../config/roles');

class User extends Model {
  static associate(models) {
    this.hasMany(models.Salon, { foreignKey: 'ownerId', as: 'salons' });
    this.hasOne(models.Staff, { foreignKey: 'userId', as: 'staff' });
  }
}

module.exports = (sequelize) => {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: ROLES.SALON_OWNER,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    onboardingCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete'),
      allowNull: true,
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};

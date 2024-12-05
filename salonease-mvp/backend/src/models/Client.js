const { DataTypes, Model } = require('sequelize');

class Client extends Model {
  static associate(models) {
    this.belongsTo(models.Salon, {
      foreignKey: 'salonId',
      as: 'salon',
      onDelete: 'CASCADE'
    });
  }
}
module.exports = (sequelize) => {
  Client.init({
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
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      unique: 'uniquePhonePerSalon'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPhoneNumber(value) {
          // Allow + and digits
          if (value && !/^[+\d]+$/.test(value)) {
            throw new Error('Phone number can only contain digits and + symbol');
          }
        }
      },
      unique: 'uniquePhonePerSalon'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Client',
    timestamps: true,
  });

  return Client;
};

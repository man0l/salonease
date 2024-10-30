const { Model, DataTypes } = require('sequelize');
const BOOKING_STATUSES = require('../config/bookingStatuses');

module.exports = (sequelize) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Salon, {
        foreignKey: 'salonId',
        as: 'salon',
        onDelete: 'CASCADE'
      });
      Booking.belongsTo(models.Client, {
        foreignKey: 'clientId',
        as: 'client'
      });
      Booking.belongsTo(models.Service, {
        foreignKey: 'serviceId',
        as: 'service'
      });
      Booking.belongsTo(models.Staff, {
        foreignKey: 'staffId',
        as: 'staff'
      });
    }
  }

  Booking.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Salons',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id'
      }
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Staffs',
        key: 'id'
      }
    },
    appointmentDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BOOKING_STATUSES)),
      defaultValue: BOOKING_STATUSES.PENDING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'Bookings'
  });

  return Booking;
};
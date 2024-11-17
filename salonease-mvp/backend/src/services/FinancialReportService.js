const { Op } = require('sequelize');
const { Booking, Service, Staff } = require('../config/db');
const moment = require('moment-timezone');
const BOOKING_STATUSES = require('../config/bookingStatuses');

class FinancialReportService {
  constructor() {
    this.models = {
      Booking,
      Service,
      Staff
    };
  }

  async getRevenueReport(salonId, startDate, endDate, groupBy = 'day', timezone = 'UTC') {
    try {
      // Parse dates strictly using ISO format
      const parsedStartDate = moment.tz(startDate, 'YYYY-MM-DD', true, timezone);
      const parsedEndDate = moment.tz(endDate, 'YYYY-MM-DD', true, timezone);

      if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
        throw new Error('Invalid date format. Dates must be in YYYY-MM-DD format');
      }

      const startDateTime = parsedStartDate.startOf('day').toDate();
      const endDateTime = parsedEndDate.endOf('day').toDate();

      const bookings = await this.models.Booking.findAll({
        where: {
          salonId,
          appointmentDateTime: {
            [Op.between]: [startDateTime, endDateTime]
          },
          status: BOOKING_STATUSES.COMPLETED
        },
        include: [{
          model: this.models.Service,
          as: 'service',
          attributes: ['id', 'name', 'price']
        }],
        order: [['appointmentDateTime', 'ASC']]
      });

      const totalRevenue = bookings.reduce((sum, booking) => {
        return sum + (parseFloat(booking.service.price) || 0);
      }, 0);

      const breakdown = this.groupBookingsByDate(bookings, groupBy, timezone);

      // Calculate previous period
      const periodDuration = parsedEndDate.diff(parsedStartDate);
      const previousStartDate = parsedStartDate.clone().subtract(periodDuration, 'milliseconds').toDate();
      const previousPeriodRevenue = await this.calculatePeriodRevenue(salonId, previousStartDate, startDateTime);

      const periodComparison = {
        current: totalRevenue,
        previous: previousPeriodRevenue,
        percentageChange: previousPeriodRevenue ? Number(((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(2)) : 0,
        trend: totalRevenue > previousPeriodRevenue ? 'UP' : totalRevenue < previousPeriodRevenue ? 'DOWN' : 'STABLE'
      };

      return {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        periodComparison,
        breakdown
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  }

  groupBookingsByDate(bookings, groupBy, timezone) {
    const breakdown = {};

    bookings.forEach(booking => {
      const date = moment.tz(booking.appointmentDateTime, timezone);
      let groupKey;

      switch (groupBy?.toLowerCase()) {
        case 'week':
          groupKey = date.startOf('week').format('YYYY-MM-DD');
          break;
        case 'month':
          groupKey = date.startOf('month').format('YYYY-MM');
          break;
        default: // day
          groupKey = date.format('YYYY-MM-DD');
      }

      if (!breakdown[groupKey]) {
        breakdown[groupKey] = {
          date: groupKey,
          revenue: 0,
          bookingCount: 0,
          averageTicket: 0,
          refunds: 0,
          netRevenue: 0
        };
      }

      const price = parseFloat(booking.service.price) || 0;
      breakdown[groupKey].revenue += price;
      breakdown[groupKey].bookingCount++;
      breakdown[groupKey].netRevenue += price;
      breakdown[groupKey].averageTicket = Number((breakdown[groupKey].revenue / breakdown[groupKey].bookingCount).toFixed(2));
    });

    return Object.values(breakdown);
  }

  async calculatePeriodRevenue(salonId, startDate, endDate) {
    try {
      const bookings = await this.models.Booking.findAll({
        where: {
          salonId,
          appointmentDateTime: {
            [Op.between]: [startDate, endDate]
          },
          status: BOOKING_STATUSES.COMPLETED
        },
        include: [{
          model: this.models.Service,
          as: 'service',
          attributes: ['price']
        }]
      });

      return Number(bookings.reduce((sum, booking) => sum + (parseFloat(booking.service.price) || 0), 0).toFixed(2));
    } catch (error) {
      console.error('Error calculating period revenue:', error);
      return 0;
    }
  }
}

module.exports = new FinancialReportService();
const { Booking, Service, Client, Staff } = require('../config/db');
const { Op } = require('sequelize');
const moment = require('moment');
const BOOKING_STATUSES = require('../config/bookingStatuses');
const ROLES = require('../config/roles');

// Helper functions for date ranges
const getDateRanges = () => ({
  today: {
    start: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate()
  },
  week: {
    start: moment().startOf('week').toDate(),
    end: moment().endOf('week').toDate()
  }
});

// Helper for staff-specific dashboard stats
const getStaffDashboardStats = async (salonId, staffId) => {
  const { today } = getDateRanges();
  
  const [todayAppointments, nextAppointment] = await Promise.all([
    Booking.count({
      where: {
        salonId,
        staffId,
        appointmentDateTime: {
          [Op.between]: [today.start, today.end]
        },
        status: {
          [Op.notIn]: [BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.NO_SHOW]
        }
      }
    }),
    Booking.findOne({
      where: {
        salonId,
        staffId,
        appointmentDateTime: { [Op.gte]: moment().toDate() },
        status: { [Op.notIn]: [BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.NO_SHOW] }
      },
      include: [
        { model: Client, as: 'client', attributes: ['name'] },
        { model: Service, as: 'service', attributes: ['name'] }
      ],
      order: [['appointmentDateTime', 'ASC']]
    })
  ]);

  return {
    todayAppointments,
    nextAppointment: nextAppointment ? {
      clientName: nextAppointment.client.name,
      service: nextAppointment.service.name,
      time: moment(nextAppointment.appointmentDateTime).format('HH:mm')
    } : null
  };
};

// Helper for salon-wide dashboard stats
const getSalonDashboardStats = async (salonId) => {
  const { today, week } = getDateRanges();
  
  const [todayAppointments, weeklyRevenue] = await Promise.all([
    Booking.count({
      where: {
        salonId,
        appointmentDateTime: { [Op.between]: [today.start, today.end] },
        status: { [Op.notIn]: [BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.NO_SHOW] }
      }
    }),
    calculateWeeklyRevenue(salonId, week.start, week.end)
  ]);

  return {
    todayAppointments,
    weeklyRevenue: weeklyRevenue || '0,00'
  };
};

// Helper for calculating weekly revenue
const calculateWeeklyRevenue = async (salonId, startDate, endDate) => {
  const bookings = await Booking.findAll({
    where: {
      salonId,
      appointmentDateTime: { [Op.between]: [startDate, endDate] },
      status: BOOKING_STATUSES.COMPLETED
    },
    include: [{ model: Service, as: 'service', attributes: ['price'] }]
  });

  return bookings.reduce((total, booking) => {
    const price = booking.service ? parseFloat(booking.service.price) : 0;
    return total + price;
  }, 0);
};

// Main controller functions
exports.getDashboardStats = async (req, res) => {
  try {
    const { salonId } = req.params;
    const stats = req.user.role === ROLES.STAFF
      ? await getStaffDashboardStats(salonId, req.user.id)
      : await getSalonDashboardStats(salonId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

exports.getDashboardActivity = async (req, res) => {
  try {
    const { salonId } = req.params;
    const activities = await Booking.findAll({
      where: {
        salonId,
        createdAt: {
          [Op.gte]: moment().subtract(7, 'days').toDate()
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name']
        },
        {
          model: Staff,
          as: 'staff',
          attributes: ['fullName']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      description: `${activity.client.name} booked ${activity.service.name} with ${activity.staff.fullName}`,
      timeAgo: moment(activity.createdAt).fromNow(),
      type: 'booking',
      createdAt: activity.createdAt
    }));

    res.json(activities);

  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard activity', 
      error: error.message 
    });
  }
}; 
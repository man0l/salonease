const { Booking, Service, Client, Staff } = require('../config/db');
const { Op } = require('sequelize');
const moment = require('moment');
const BOOKING_STATUSES = require('../config/bookingStatuses');

exports.getDashboardStats = async (req, res) => {
  try {
    const { salonId } = req.params;
    const today = moment().startOf('day');
    const weekStart = moment().startOf('week');
    const weekEnd = moment().endOf('week');

    const [todayAppointments, weeklyRevenue] = await Promise.all([
      // Get today's appointments count
      Booking.count({
        where: {
          salonId,
          appointmentDateTime: {
            [Op.between]: [today.toDate(), moment().endOf('day').toDate()]
          },
          status: {
            [Op.notIn]: [BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.NO_SHOW]
          }
        }
      }),

      // Calculate weekly revenue
      Booking.findAll({
        where: {
          salonId,
          appointmentDateTime: {
            [Op.between]: [weekStart.toDate(), weekEnd.toDate()]
          },
          status: BOOKING_STATUSES.COMPLETED
        },
        include: [{
          model: Service,
          as: 'service',
          attributes: ['price']
        }]
      }).then(bookings => {
        const total = bookings.reduce((total, booking) => {
          const price = booking.service ? parseFloat(booking.service.price) : 0;
          return total + price;
        }, 0);
        return total;
      })
    ]);

    res.json({
      todayAppointments,
      weeklyRevenue: weeklyRevenue || '0,00'
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard stats', 
      error: error.message 
    });
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

    res.json(formattedActivities);

  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard activity', 
      error: error.message 
    });
  }
}; 
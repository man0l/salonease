const { Booking, Staff, Service, Client, Salon } = require('../config/db');
const { Op } = require('sequelize');
const BOOKING_STATUSES = require('../config/bookingStatuses');
const { validateCreateBooking, validateUpdateBooking } = require('../validators/bookingValidator');
const sequelize = require('../config/db').sequelize;
const moment = require('moment');
const ROLES = require('../config/roles');
const SubscriptionService = require('../services/subscriptionService');
const subscriptionService = new SubscriptionService();

exports.getBookings = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate, staffId, serviceId, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { salonId };
    
    if (staffId) {
      whereClause.staffId = staffId;
    }
    
    if (startDate && endDate) {
      whereClause.appointmentDateTime = {
        [Op.between]: [
          moment(startDate).startOf('day').toDate(),
          moment(endDate).endOf('day').toDate()
        ]
      };
    }

    if (serviceId) whereClause.serviceId = serviceId;
    if (status) whereClause.status = status;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Client, 
          as: 'client', 
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Service, 
          as: 'service', 
          attributes: ['id', 'name', 'duration', 'price'] 
        },
        { 
          model: Staff, 
          as: 'staff', 
          attributes: ['id', 'fullName'] 
        }
      ],
      limit,
      offset,
      order: [
        ['appointmentDateTime', 'DESC']
      ]
    });
    
    res.json({
      bookings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { error, value } = validateCreateBooking(req.body);    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { staffId, appointmentDateTime, serviceId, clientName, clientEmail, clientPhone } = value;
    const { salonId } = req.params;

    // If clientName and clientPhone are provided, create a new client first
    let clientId = value.clientId;
    if (!clientId && clientName && clientPhone) {
      const [client] = await Client.findOrCreate({
        where: { 
          phone: clientPhone,
          salonId 
        },
        defaults: {
          name: clientName,
          email: clientEmail,
          salonId
        }
      });
      clientId = client.id;
    }

    // Add clientId to the booking data
    const bookingData = {
      ...value,
      clientId,
      salonId
    };

    // Check if staff belongs to salon
    const staff = await Staff.findOne({ 
      where: { id: staffId, salonId }
    });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found in this salon' });
    }

    // Get service duration
    const service = await Service.findOne({ 
      where: { id: serviceId, salonId }
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found in this salon' });
    }

    // Calculate appointment end time
    const appointmentDate = new Date(appointmentDateTime);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        staffId,
        status: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.CONFIRMED],
        [Op.or]: [
          {
            appointmentDateTime: {
              [Op.gte]: appointmentDateTime,
              [Op.lt]: endTime
            }
          },
          {
            endTime: {
              [Op.gt]: appointmentDateTime,
              [Op.lte]: endTime
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const result = await Booking.create({
      ...bookingData,
      endTime,
      status: BOOKING_STATUSES.PENDING
    });

    // Add subscription charge for the booking
    try {
      const salon = await Salon.findOne({ where: { id: salonId } });
      const subscription = await subscriptionService.getSubscriptionStatus(salon.ownerId);
      console.log(subscription.usage);
      await subscriptionService.addBookingCharge(salon.ownerId);
    } catch (subscriptionError) {
      console.error('Error adding booking charge:', subscriptionError);
      // Continue even if subscription charge fails
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating booking:', error);
    const status = error.status || 500;
    const message = error.status ? error.message : 'Error creating booking';
    res.status(status).json({ message, errors: error.errors });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if booking is cancelled before allowing updates
    if (booking.status === BOOKING_STATUSES.CANCELLED) {
      return res.status(400).json({ message: "Cannot update a cancelled booking" });
    }

    const { error, value } = validateUpdateBooking(req.body);
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { salonId } = req.params;

    if (value.appointmentDateTime) {
      // Perform the same availability checks as in createBooking
      const service = await Service.findByPk(booking.serviceId);
      const appointmentDate = new Date(value.appointmentDateTime);
      const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
      value.endTime = endTime;

      // Check for conflicts
      const conflictingBooking = await Booking.findOne({
        where: {
          staffId: booking.staffId,
          id: { [Op.ne]: booking.id },
          status: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.CONFIRMED],
          [Op.or]: [
            {
              appointmentDateTime: { [Op.lt]: endTime },
              endTime: { [Op.gt]: value.appointmentDateTime }
            }
          ]
        }
      });

      if (conflictingBooking) {
        return res.status(400).json({ message: 'Time slot is not available' });
      }
    }

    await booking.update(value);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { salonId, bookingId } = req.params;
    const { notes } = req.body;
    
    const booking = await Booking.findOne({ 
      where: { id: bookingId, salonId }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.update({ 
      status: BOOKING_STATUSES.CANCELLED,
      notes: notes || booking.notes // Preserve existing notes if no new note is provided
    });
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }

}; 


exports.createManychatBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { salonId, serviceId, staffId, clientInfo, appointmentDateTime } = req.body;
    
    // Validate client info
    if (!clientInfo || !clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      return res.status(400).json({ 
        message: 'Missing required client information' 
      });
    }

    // Find or create client
    const [client] = await Client.findOrCreate({
      where: { 
        email: clientInfo.email,
        salonId 
      },
      defaults: {
        name: clientInfo.name,
        phone: clientInfo.phone,
        salonId
      },
      transaction
    });

    // Prepare booking data
    const bookingData = {
      salonId,
      clientId: client.id,
      serviceId,
      staffId,
      appointmentDateTime,
      notes: clientInfo.notes || null
    };

    // Validate booking data using existing validator
    const { error, value } = validateCreateBooking(bookingData);
    if (error) {
      await transaction.rollback();
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errorMessages 
      });
    }

    // Check if staff belongs to salon
    const staff = await Staff.findOne({ 
      where: { id: staffId, salonId },
      transaction
    });
    if (!staff) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Staff not found in this salon' 
      });
    }

    // Get service duration
    const service = await Service.findOne({ 
      where: { id: serviceId, salonId },
      transaction
    });
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Service not found in this salon' 
      });
    }

    // Calculate appointment end time
    const appointmentDate = new Date(appointmentDateTime);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        staffId,
        status: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.CONFIRMED],
        [Op.or]: [
          {
            appointmentDateTime: {
              [Op.gte]: appointmentDateTime,
              [Op.lt]: endTime
            }
          },
          {
            endTime: {
              [Op.gt]: appointmentDateTime,
              [Op.lte]: endTime
            }
          }
        ]
      },
      transaction
    });

    if (conflictingBooking) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Time slot is not available' 
      });
    }

    // Create booking
    const booking = await Booking.create({
      ...value,
      salonId,
      endTime,
      status: BOOKING_STATUSES.PENDING
    }, { transaction });

    await transaction.commit();

    // Return success response with booking details
    res.status(201).json({
      booking: {
        id: booking.id,
        appointmentDateTime: booking.appointmentDateTime,
        endTime: booking.endTime,
        status: booking.status,
        service: {
          name: service.name,
          duration: service.duration,
          price: service.price
        },
        staff: {
          name: staff.fullName
        },
        client: {
          name: client.name,
          email: client.email,
          phone: client.phone
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating Manychat booking:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
};

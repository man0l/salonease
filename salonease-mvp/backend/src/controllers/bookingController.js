const { Booking, Staff, Service, Client, StaffAvailability } = require('../config/db');
const { Op } = require('sequelize');
const BOOKING_STATUSES = require('../config/bookingStatuses');
const { validateCreateBooking, validateUpdateBooking } = require('../validators/bookingValidator');

exports.getBookings = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate, staffId, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { salonId };
    
    if (startDate && endDate) {
      whereClause.appointmentDateTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (staffId) whereClause.staffId = staffId;
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
      order: [['appointmentDateTime', 'ASC']]
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

    const { staffId, appointmentDateTime, serviceId } = value;
    const { salonId } = req.params;

    // Check if staff belongs to salon
    const staff = await Staff.findOne({ where: { id: staffId, salonId } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found in this salon' });
    }

    // Get service duration
    const service = await Service.findOne({ where: { id: serviceId, salonId } });
    if (!service) {
      return res.status(404).json({ message: 'Service not found in this salon' });
    }

    // Calculate appointment end time
    const appointmentDate = new Date(appointmentDateTime);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    // Check staff availability
    const dayOfWeek = appointmentDate.getDay();
    const availability = await StaffAvailability.findOne({
      where: {
        staffId,
        salonId,
        dayOfWeek,
        type: 'AVAILABILITY',
        startTime: { [Op.lte]: appointmentDate },
        endTime: { [Op.gte]: endTime }
      }
    });

    if (!availability) {
      return res.status(400).json({ message: 'Staff is not available at this time' });
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      where: {
        staffId,
        status: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.CONFIRMED],
        [Op.or]: [
          {
            appointmentDateTime: {
              [Op.lt]: endTime,
              [Op.gt]: appointmentDateTime
            }
          },
          {
            endTime: {
              [Op.gt]: appointmentDateTime,
              [Op.lt]: endTime
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const booking = await Booking.create({
      ...value,
      salonId,
      endTime,
      status: BOOKING_STATUSES.PENDING
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
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
    const booking = await Booking.findOne({ 
      where: { id: bookingId, salonId }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.update({ status: BOOKING_STATUSES.CANCELLED });
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
}; 
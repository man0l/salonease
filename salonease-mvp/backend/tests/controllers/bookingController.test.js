const { 
  sequelize, 
  User, 
  Salon, 
  Staff, 
  Service, 
  Client, 
  Booking,
  Category,
  StaffAvailability
} = require('../setupTests');
const bookingController = require('../../src/controllers/bookingController')
const BOOKING_STATUSES = require('../../src/config/bookingStatuses');
const { Op } = require('sequelize');
const STAFF_AVAILABILITY_TYPES = require('../../src/config/staffAvailabilityTypes');

describe('Booking Controller', () => {
  let salon, staff, service, client, mockReq, mockRes, owner;

  beforeEach(async () => {
    // Create owner and salon
    owner = await User.create({ 
      email: 'owner@test.com', 
      password: 'password', 
      fullName: 'Test Owner', 
      role: 'SalonOwner' 
    });

    salon = await Salon.create({ 
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: owner.id
    });

    // Create staff
    const staffUser = await User.create({ 
      email: 'staff@test.com', 
      password: 'password', 
      fullName: 'Test Staff', 
      role: 'Staff' 
    });
    
    staff = await Staff.create({ 
      userId: staffUser.id, 
      salonId: salon.id, 
      fullName: 'Test Staff', 
      email: 'staff@test.com' 
    });

    const category = await Category.create({
        name: 'Test Category',
        salonId: salon.id
    });

    // Create service
    service = await Service.create({
      name: 'Test Service',
      duration: 60,
      price: 100,
      salonId: salon.id,
      categoryId: category.id
    });

    // Create client
    client = await Client.create({
      name: 'Test Client',
      email: 'client@test.com',
      phone: '1234567890',
      salonId: salon.id
    });

    await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: new Date().getDay(),
        startTime: '09:00',
        endTime: '17:00',
        type: STAFF_AVAILABILITY_TYPES.AVAILABILITY
      });

    // Mock request and response
    mockReq = {
      params: { salonId: salon.id },
      body: {},
      query: {}
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getBookings', () => {
    it('should fetch bookings for a salon', async () => {
      const appointmentDateTime = new Date('2024-03-20T10:00:00');
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      const booking = await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.CONFIRMED
      });

      await bookingController.getBookings(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bookings: expect.arrayContaining([
            expect.objectContaining({
              id: booking.id,
              salonId: salon.id,
              status: BOOKING_STATUSES.CONFIRMED
            })
          ])
        })
      );
    });

    it('should filter bookings by date range', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endTime = new Date(futureDate.getTime() + (service.duration * 60 * 1000));

      await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: futureDate,
        endTime,
        status: BOOKING_STATUSES.PENDING
      });

      mockReq.query = {
        startDate: new Date().toISOString(),
        endDate: new Date(futureDate.getTime() + 86400000).toISOString()
      };

      await bookingController.getBookings(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalItems: 1
        })
      );
    });

    it('should filter bookings by staff member', async () => {
      const appointmentDateTime = new Date('2024-03-20T10:00:00');
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.CONFIRMED
      });

      mockReq.query = { staffId: staff.id };

      await bookingController.getBookings(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalItems: 1,
          bookings: expect.arrayContaining([
            expect.objectContaining({
              staffId: staff.id
            })
          ])
        })
      );
    });

    it('should filter bookings by status', async () => {
      const appointmentDateTime = new Date('2024-03-20T10:00:00');
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.PENDING
      });

      mockReq.query = { status: BOOKING_STATUSES.PENDING };

      await bookingController.getBookings(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalItems: 1,
          bookings: expect.arrayContaining([
            expect.objectContaining({
              status: BOOKING_STATUSES.PENDING
            })
          ])
        })
      );
    });
  });

  describe('createBooking', () => {
    it('should prevent double booking', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      appointmentDateTime.setHours(10, 0, 0, 0);
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.CONFIRMED
      });

      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        endTime: endTime.toISOString(),
        salonId: salon.id
      };

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/staff.*not available/i)
        })
      );
    });

    it('should create a new booking during business hours', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      appointmentDateTime.setHours(10, 0, 0, 0);
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      // Delete any existing availability
      await StaffAvailability.destroy({
        where: { staffId: staff.id }
      });

      // Create availability for the specific day
      await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: appointmentDateTime.getDay(),
        startTime: '09:00:00',
        endTime: '17:00:00',
        type: STAFF_AVAILABILITY_TYPES.AVAILABILITY
      });

      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        endTime: endTime.toISOString(),
        salonId: salon.id
      };

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          salonId: salon.id,
          clientId: client.id,
          staffId: staff.id,
          serviceId: service.id,
          appointmentDateTime: expect.any(Date),
          endTime: expect.any(Date),
          status: BOOKING_STATUSES.PENDING
        })
      );
    });

    it('should return 400 if service duration exceeds staff availability', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      appointmentDateTime.setHours(16, 30, 0, 0); // 16:30
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));
      
      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        endTime: endTime.toISOString(),
        salonId: salon.id
      };

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Staff is not available at this time"
        })
      );
    });

    it('should return 400 if booking is made outside business hours', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      appointmentDateTime.setHours(8, 0, 0, 0); // 8:00 AM
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        endTime: endTime.toISOString(),
        salonId: salon.id
      };

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Staff is not available at this time"
        })
      );
    });
  });

  describe('updateBooking', () => {
    it('should update booking status', async () => {
      const appointmentDateTime = new Date();
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      const booking = await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.PENDING
      });

      mockReq.params.bookingId = booking.id;
      mockReq.body = {
        status: BOOKING_STATUSES.CONFIRMED
      };

      await bookingController.updateBooking(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: booking.id,
          status: BOOKING_STATUSES.CONFIRMED
        })
      );
    });

    it('should prevent updating to invalid status', async () => {
      const appointmentDateTime = new Date();
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      const booking = await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.PENDING
      });

      mockReq.params.bookingId = booking.id;
      mockReq.body = {
        status: 'INVALID_STATUS',
        salonId: salon.id
      };

      await bookingController.updateBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation error",
          errors: expect.arrayContaining([
            expect.stringMatching(/must be one of/)
          ])
        })
      );
    });

    it('should prevent updating cancelled bookings', async () => {
      // Create a booking that's already cancelled
      const appointmentDateTime = new Date();
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      const booking = await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.CANCELLED
      });

      // Set up the mock request
      mockReq.params = { 
        bookingId: booking.id,
        salonId: salon.id 
      };
      mockReq.body = {
        status: BOOKING_STATUSES.CONFIRMED,
        salonId: salon.id
      };

      // Call the controller
      await bookingController.updateBooking(mockReq, mockRes);

      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Cannot update a cancelled booking"
      });
    });
  });

  describe('deleteBooking', () => {
    it('should cancel a booking', async () => {
      const appointmentDateTime = new Date();
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      const booking = await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.PENDING
      });

      mockReq.params.bookingId = booking.id;

      await bookingController.deleteBooking(mockReq, mockRes);

      const updatedBooking = await Booking.findByPk(booking.id);
      expect(updatedBooking.status).toBe(BOOKING_STATUSES.CANCELLED);
    });
  });
}); 
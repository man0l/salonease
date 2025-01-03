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
const BOOKING_STATUSES = require('../../src/config/bookingStatuses');
const { Op } = require('sequelize');
const STAFF_AVAILABILITY_TYPES = require('../../src/config/staffAvailabilityTypes');

// Create mock services before any imports or jest.mock calls
const mockSubscriptionService = {
  getSubscriptionStatus: jest.fn().mockResolvedValue({
    usage: 0,
    limit: 100,
    isActive: true
  }),
  addBookingCharge: jest.fn().mockResolvedValue(true),
  startTrialSubscription: jest.fn().mockResolvedValue(true)
};

const mockTwilioService = {
  sendBookingConfirmation: jest.fn().mockImplementation((phone, details) => {
    return Promise.resolve({
      sid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      status: 'queued',
      details: {
        ...details,
        appointmentDateTime: details.appointmentDateTime.toISOString()
      }
    });
  }),
  scheduleBookingReminders: jest.fn().mockImplementation((booking, client, staff, salon, service) => {
    const appointmentDateTime = new Date(booking.appointmentDateTime);
    const clientReminderDate = new Date(appointmentDateTime);
    clientReminderDate.setHours(clientReminderDate.getHours() - 1);
    const staffReminderDate = new Date(appointmentDateTime);
    staffReminderDate.setMinutes(staffReminderDate.getMinutes() - 15);

    return Promise.resolve({
      clientReminder: {
        date: clientReminderDate,
        phone: client.phone,
        details: {
          salonName: salon.name,
          appointmentDateTime: booking.appointmentDateTime,
          serviceName: service.name
        }
      },
      staffReminder: {
        date: staffReminderDate,
        phone: staff.phone,
        details: {
          salonName: salon.name,
          appointmentDateTime: booking.appointmentDateTime,
          serviceName: service.name,
          clientName: client.name
        }
      }
    });
  }),
  sendUpcomingBookingReminder: jest.fn().mockResolvedValue({
    sid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    status: 'queued'
  }),
  sendStaffBookingReminder: jest.fn().mockResolvedValue({
    sid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    status: 'queued'
  })
};

// Mock services
jest.mock('../../src/services/subscriptionService', () => ({
  getInstance: jest.fn(() => mockSubscriptionService)
}));

jest.mock('../../src/services/twilioService', () => ({
  getInstance: jest.fn(() => mockTwilioService)
}));

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_mock123' })
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'sub_mock123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'sub_mock123' }),
      update: jest.fn().mockResolvedValue({ id: 'sub_mock123' })
    },
    paymentMethods: {
      attach: jest.fn().mockResolvedValue({ id: 'pm_mock123' })
    }
  }));
});

// Mock twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'test-sid',
        status: 'sent'
      })
    }
  }));
});

// Require the controller after all mocks are set up
const bookingController = require('../../src/controllers/bookingController');

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
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      clone: function() {
        return {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis()
        };
      }
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

      // Calculate endTime based on service duration
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      // Create first booking
      await Booking.create({
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        salonId: salon.id,
        status: BOOKING_STATUSES.CONFIRMED
      });

      // Attempt second booking
      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: BOOKING_STATUSES.PENDING
      };
      mockReq.params = { salonId: salon.id };

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Time slot is not available'
        })
      );
    });

    it('should create a new booking during business hours', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      appointmentDateTime.setHours(10, 0, 0, 0);

      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: BOOKING_STATUSES.PENDING
      };
      mockReq.params = { salonId: salon.id };

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          salonId: salon.id,
          clientId: client.id,
          staffId: staff.id,
          status: BOOKING_STATUSES.PENDING
        })
      );

      expect(mockSubscriptionService.getSubscriptionStatus).toHaveBeenCalled();
      expect(mockSubscriptionService.addBookingCharge).toHaveBeenCalled();
    });

    it('should send notifications when booking is created', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      appointmentDateTime.setHours(10, 0, 0, 0);

      mockReq.body = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: BOOKING_STATUSES.PENDING
      };
      mockReq.params = { salonId: salon.id };

      // Clear previous mock calls
      mockTwilioService.sendBookingConfirmation.mockClear();
      mockTwilioService.scheduleBookingReminders.mockClear();

      await bookingController.createBooking(mockReq, mockRes);

      expect(mockTwilioService.sendBookingConfirmation).toHaveBeenCalledWith(
        client.phone,
        {
          salonName: salon.name,
          appointmentDateTime: new Date(appointmentDateTime),
          serviceName: service.name
        }
      );

      expect(mockTwilioService.scheduleBookingReminders).toHaveBeenCalledWith(
        expect.objectContaining({ 
          appointmentDateTime: expect.any(Date),
          clientId: expect.any(String),
          salonId: expect.any(String),
          serviceId: expect.any(String),
          staffId: expect.any(String)
        }), // booking
        expect.objectContaining({ 
          id: expect.any(String),
          phone: client.phone,
          name: client.name 
        }), // client
        expect.objectContaining({ 
          id: expect.any(String),
          fullName: staff.fullName,
          email: staff.email
        }), // staff
        expect.objectContaining({ 
          id: expect.any(String),
          name: salon.name,
          address: salon.address
        }), // salon
        expect.objectContaining({ 
          id: expect.any(String),
          name: service.name,
          duration: service.duration
        }) // service
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
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
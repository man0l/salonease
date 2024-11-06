const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Salon, Staff, Service, Client, Booking, Category, StaffAvailability } = require('../setupTests');
const BOOKING_STATUSES = require('../../src/config/bookingStatuses');
const jwt = require('jsonwebtoken');
const ROLES = require('../../src/config/roles');
const STAFF_AVAILABILITY_TYPES = require('../../src/config/staffAvailabilityTypes');
const crypto = require('crypto');

describe('Booking Routes', () => {
  let token, salon, staff, service, client;

  beforeEach(async () => {
    // Create owner and generate token
    const owner = await User.create({
      fullName: 'Salon Owner',
      email: 'owner@example.com',
      password: 'Password123!',
      role: ROLES.SALON_OWNER
    });

    token = jwt.sign({ userId: owner.id, role: owner.role }, process.env.JWT_SECRET);

    // Create test data
    salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: owner.id
    });

    const staffUser = await User.create({
      email: 'staff@example.com',
      password: 'Password123!',
      fullName: 'Staff Member',
      role: ROLES.STAFF
    });

    staff = await Staff.create({
      userId: staffUser.id,
      salonId: salon.id,
      fullName: 'Staff Member',
      email: 'staff@example.com'
    });

    const category = await Category.create({
      name: 'Test Category',
      id: 1
    });

    service = await Service.create({
      name: 'Test Service',
      duration: 60,
      price: 100,
      salonId: salon.id,
      categoryId: category.id
    });

    client = await Client.create({
      name: 'Test Client',
      email: 'client@example.com',
      phone: '1234567890',
      salonId: salon.id
    });
  });

  describe('POST /api/bookings/:salonId', () => {
    it('should create a new booking', async () => {
      // Set appointment time to next business day at 10 AM
      const appointmentDateTime = new Date();
      appointmentDateTime.setDate(appointmentDateTime.getDate() + 1); // next day
      appointmentDateTime.setHours(10, 0, 0, 0); // 10:00 AM

      // Ensure it's not on weekend
      if (appointmentDateTime.getDay() === 0) { // If Sunday
        appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      } else if (appointmentDateTime.getDay() === 6) { // If Saturday
        appointmentDateTime.setDate(appointmentDateTime.getDate() + 2);
      }

      // Add staff availability for the booking time
      await StaffAvailability.create({
        staffId: staff.id,
        dayOfWeek: appointmentDateTime.getDay(),
        startTime: '09:00',
        endTime: '17:00',
        salonId: salon.id,
        type: STAFF_AVAILABILITY_TYPES.AVAILABILITY
      });

      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

      const bookingData = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: BOOKING_STATUSES.PENDING
      };

      const response = await request(app)
        .post(`/api/bookings/${salon.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      if (response.status !== 201) {
        console.log('Response body:', response.body);
        console.log('Attempted booking time:', appointmentDateTime);
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe(BOOKING_STATUSES.PENDING);
    });

    it('should return 400 when booking time is outside staff availability', async () => {
      const appointmentDateTime = new Date();
      appointmentDateTime.setHours(8, 0, 0, 0); // 8:00 AM (before staff availability)

      const bookingData = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: BOOKING_STATUSES.PENDING
      };

      const response = await request(app)
        .post(`/api/bookings/${salon.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    it('should return 400 when booking overlaps with existing booking', async () => {
      // Create an existing booking
      const existingBookingTime = new Date();
      existingBookingTime.setDate(existingBookingTime.getDate() + 1);
      existingBookingTime.setHours(10, 0, 0, 0);

      // Calculate endTime based on service duration
      const endTime = new Date(existingBookingTime.getTime() + (service.duration * 60 * 1000));

      await Booking.create({
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: existingBookingTime,
        endTime: endTime,
        status: BOOKING_STATUSES.CONFIRMED,
        salonId: salon.id
      });

      // Try to create an overlapping booking
      const overlappingBookingTime = new Date(existingBookingTime);
      overlappingBookingTime.setMinutes(30); // 30 minutes after start of existing booking

      const bookingData = {
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: overlappingBookingTime.toISOString(),
        status: BOOKING_STATUSES.PENDING
      };

      const response = await request(app)
        .post(`/api/bookings/${salon.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Time slot is not available');
    });
  });

  describe('GET /api/bookings/:salonId', () => {
    it('should fetch salon bookings', async () => {
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

      const response = await request(app)
        .get(`/api/bookings/${salon.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].id).toBe(booking.id);
    });

    it('should fetch bookings with date range filter', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Create multiple bookings
      await Booking.bulkCreate([
        {
          salonId: salon.id,
          clientId: client.id,
          staffId: staff.id,
          serviceId: service.id,
          appointmentDateTime: startDate,
          endTime: new Date(startDate.getTime() + (service.duration * 60 * 1000)),
          status: BOOKING_STATUSES.PENDING
        },
        {
          salonId: salon.id,
          clientId: client.id,
          staffId: staff.id,
          serviceId: service.id,
          appointmentDateTime: endDate,
          endTime: new Date(endDate.getTime() + (service.duration * 60 * 1000)),
          status: BOOKING_STATUSES.PENDING
        }
      ]);

      const response = await request(app)
        .get(`/api/bookings/${salon.id}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toHaveLength(2);
    });

    it('should fetch bookings with status filter', async () => {
      // Create bookings with different statuses
      await Booking.bulkCreate([
        {
          salonId: salon.id,
          clientId: client.id,
          staffId: staff.id,
          serviceId: service.id,
          appointmentDateTime: new Date(),
          endTime: new Date(new Date().getTime() + (service.duration * 60 * 1000)),
          status: BOOKING_STATUSES.CONFIRMED
        },
        {
          salonId: salon.id,
          clientId: client.id,
          staffId: staff.id,
          serviceId: service.id,
          appointmentDateTime: new Date(),
          endTime: new Date(new Date().getTime() + (service.duration * 60 * 1000)),
          status: BOOKING_STATUSES.PENDING
        }
      ]);

      const response = await request(app)
        .get(`/api/bookings/${salon.id}`)
        .query({ status: BOOKING_STATUSES.CONFIRMED })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].status).toBe(BOOKING_STATUSES.CONFIRMED);
    });

    it('should paginate bookings', async () => {
      // Create multiple bookings
      const bookings = Array(15).fill().map(() => ({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime: new Date(),
        endTime: new Date(new Date().getTime() + (service.duration * 60 * 1000)),
        status: BOOKING_STATUSES.PENDING
      }));

      await Booking.bulkCreate(bookings);

      const response = await request(app)
        .get(`/api/bookings/${salon.id}`)
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toHaveLength(10);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should return 401 when accessing bookings without token', async () => {
      const response = await request(app)
        .get(`/api/bookings/${salon.id}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication token is missing');
    });

    it('should return 403 when accessing bookings from another salon', async () => {
      const otherSalon = await Salon.create({
        name: 'Other Salon',
        address: '456 Other St',
        contactNumber: '0987654321',
        ownerId: (await User.create({
          fullName: 'Other Owner',
          email: 'other@example.com',
          password: 'Password123!',
          role: ROLES.SALON_OWNER
        })).id
      });

      const response = await request(app)
        .get(`/api/bookings/${otherSalon.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You do not have permission to access this salon as a salon owner');
    });
  });

  describe('POST /api/bookings/manychat', () => {
    it('should create a booking via Manychat webhook', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const body = {
        salonId: salon.id,
        serviceId: service.id,
        staffId: staff.id,
        clientInfo: {
          name: 'Test Client',
          email: 'test@example.com',
          phone: '1234567890'
        },
        appointmentDateTime: new Date().toISOString()
      };

      const signature = crypto
        .createHmac('sha256', process.env.MANYCHAT_WEBHOOK_SECRET)
        .update(`${timestamp}.${JSON.stringify(body)}`)
        .digest('hex');

      const response = await request(app)
        .post('/api/bookings/manychat')
        .set('x-api-key', process.env.MANYCHAT_API_KEY)
        .set('x-manychat-signature', signature)
        .set('x-manychat-timestamp', timestamp)
        .send(body);

      expect(response.status).toBe(201);
      expect(response.body.booking).toBeDefined();
    });
  });
});
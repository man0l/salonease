const request = require('supertest');
const app = require('../../src/app');
const { User, Salon, Booking, Service, Category, Staff, Client } = require('../setupTests');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const BOOKING_STATUSES = require('../../src/config/bookingStatuses');
const moment = require('moment');

describe('Report Routes', () => {
  let token, owner, salon, service, staff, client;

  beforeEach(async () => {
    // Create owner
    owner = await User.create({
      fullName: 'Test Owner',
      email: 'owner@example.com',
      password: 'Password123!',
      role: 'SalonOwner',
      isEmailVerified: true
    });

    // Create token
    token = jwt.sign({ userId: owner.id, role: owner.role }, process.env.JWT_SECRET);

    // Create salon
    salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: owner.id
    });

    // Create category
    const category = await Category.create({
      name: 'Test Category'
    });

    // Create service
    service = await Service.create({
      name: 'Test Service',
      duration: 60,
      price: 100,
      salonId: salon.id,
      categoryId: category.id
    });

    // Create staff user
    const staffUser = await User.create({
      fullName: 'Test Staff',
      email: 'staff@example.com',
      password: 'Password123!',
      role: 'Staff'
    });

    // Create staff
    staff = await Staff.create({
      userId: staffUser.id,
      salonId: salon.id,
      fullName: 'Test Staff',
      email: 'staff@example.com'
    });

    // Create client
    client = await Client.create({
      name: 'Test Client',
      email: 'client@example.com',
      phone: '1234567890',
      salonId: salon.id
    });
  });

  describe('GET /api/reports/:salonId/revenue', () => {
    it('should get revenue report for a salon', async () => {
      // Create completed booking
      const appointmentDateTime = new Date();
      const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));
      
      await Booking.create({
        salonId: salon.id,
        clientId: client.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDateTime,
        endTime,
        status: BOOKING_STATUSES.COMPLETED
      });

      // Format dates in YYYY-MM-DD format
      const startDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const endDate = moment().format('YYYY-MM-DD');

      const response = await request(app)
        .get(`/api/reports/${salon.id}/revenue`)
        .query({
          startDate,
          endDate,
          groupBy: 'day',
          timezone: 'UTC'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('periodComparison');
      expect(response.body).toHaveProperty('breakdown');
    });

    it('should return 401 when accessing without token', async () => {
      const response = await request(app)
        .get(`/api/reports/${salon.id}/revenue`);

      expect(response.status).toBe(401);
    });

    it('should return 403 when accessing with non-owner role', async () => {
      const staffUser = await User.create({
        fullName: 'Staff User',
        email: 'staff2@example.com',
        password: 'Password123!',
        role: 'Staff',
        isEmailVerified: true
      });

      const staffToken = jwt.sign(
        { userId: staffUser.id, role: staffUser.role },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get(`/api/reports/${salon.id}/revenue`)
        .query({
          startDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
          endDate: moment().format('YYYY-MM-DD'),
          groupBy: 'day'
        })
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid date range', async () => {
      const response = await request(app)
        .get(`/api/reports/${salon.id}/revenue`)
        .query({
          startDate: 'invalid-date',
          endDate: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
}); 
const FinancialReportService = require('../../src/services/FinancialReportService');
const { Booking, Service, Salon, User, Category, Staff, Client } = require('../setupTests');
const moment = require('moment-timezone');
const BOOKING_STATUSES = require('../../src/config/bookingStatuses');

describe('Financial Report Service', () => {
  let salon, service, owner, category, staff, client;

  beforeEach(async () => {
    // Create owner first
    owner = await User.create({
      fullName: 'Test Owner',
      email: 'owner@test.com',
      password: 'password123',
      role: 'SalonOwner'
    });

    salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: owner.id
    });

    // Create category first
    category = await Category.create({
      name: 'Test Category',
      description: 'Test Category Description'
    });

    service = await Service.create({
      name: 'Test Service',
      duration: 60,
      price: 100,
      salonId: salon.id,
      categoryId: category.id
    });

    // Create staff
    const staffUser = await User.create({
      fullName: 'Test Staff',
      email: 'staff@test.com',
      password: 'password123',
      role: 'Staff'
    });

    staff = await Staff.create({
      userId: staffUser.id,
      salonId: salon.id,
      fullName: 'Test Staff',
      email: 'staff@test.com'
    });

    // Create client
    client = await Client.create({
      name: 'Test Client',
      email: 'client@test.com',
      phone: '1234567890',
      salonId: salon.id
    });
  });

  describe('getRevenueReport', () => {
    it('should generate revenue report with daily breakdown', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');

      // Create test bookings with all required fields
      await Booking.bulkCreate([
        {
          salonId: salon.id,
          serviceId: service.id,
          clientId: client.id,
          staffId: staff.id,
          appointmentDateTime: new Date('2024-01-01T10:00:00'),
          endTime: new Date('2024-01-01T11:00:00'),
          status: BOOKING_STATUSES.COMPLETED
        },
        {
          salonId: salon.id,
          serviceId: service.id,
          clientId: client.id,
          staffId: staff.id,
          appointmentDateTime: new Date('2024-01-02T14:00:00'),
          endTime: new Date('2024-01-02T15:00:00'),
          status: BOOKING_STATUSES.COMPLETED
        }
      ]);

      const report = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate,
        'day'
      );

      expect(report).toHaveProperty('totalRevenue', 200);
      expect(report.breakdown).toHaveLength(2);
      expect(report.periodComparison).toHaveProperty('trend');
    });

    it('should handle different grouping periods', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await Booking.create({
        salonId: salon.id,
        serviceId: service.id,
        clientId: client.id,
        staffId: staff.id,
        appointmentDateTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T11:00:00'),
        status: BOOKING_STATUSES.COMPLETED
      });

      const weeklyReport = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate,
        'week'
      );

      const monthlyReport = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate,
        'month'
      );

      expect(weeklyReport.breakdown.length).toBeLessThan(5);
      expect(monthlyReport.breakdown.length).toBe(1);
    });

    it('should handle timezone conversions', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');
      const timezone = 'America/New_York';

      await Booking.create({
        salonId: salon.id,
        serviceId: service.id,
        clientId: client.id,
        staffId: staff.id,
        appointmentDateTime: new Date('2024-01-01T23:00:00Z'), // This could be next day in EST
        endTime: new Date('2024-01-02T00:00:00Z'),
        status: BOOKING_STATUSES.COMPLETED
      });

      const report = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate,
        'day',
        timezone
      );

      expect(report.breakdown).toBeDefined();
      expect(report.totalRevenue).toBe(100);
    });

    it('should exclude non-completed bookings', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await Booking.bulkCreate([
        {
          salonId: salon.id,
          serviceId: service.id,
          clientId: client.id,
          staffId: staff.id,
          appointmentDateTime: new Date('2024-01-15T10:00:00'),
          endTime: new Date('2024-01-15T11:00:00'),
          status: BOOKING_STATUSES.COMPLETED
        },
        {
          salonId: salon.id,
          serviceId: service.id,
          clientId: client.id,
          staffId: staff.id,
          appointmentDateTime: new Date('2024-01-15T14:00:00'),
          endTime: new Date('2024-01-15T15:00:00'),
          status: BOOKING_STATUSES.CANCELLED
        }
      ]);

      const report = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate
      );

      expect(report.totalRevenue).toBe(100);
      expect(report.breakdown[0].bookingCount).toBe(1);
    });

    it('should handle DST transitions correctly', async () => {
      const startDate = new Date('2024-03-09'); // Day before DST
      const endDate = new Date('2024-03-11');   // Day after DST
      const timezone = 'America/New_York';

      await Booking.create({
        salonId: salon.id,
        serviceId: service.id,
        clientId: client.id,
        staffId: staff.id,
        appointmentDateTime: new Date('2024-03-10T02:30:00Z'),
        endTime: new Date('2024-03-10T03:30:00Z'),
        status: BOOKING_STATUSES.COMPLETED
      });

      const report = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate,
        'day',
        timezone
      );

      expect(report.breakdown).toBeDefined();
      expect(report.breakdown.length).toBe(1);
    });

    it('should calculate period comparison metrics correctly', async () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-31');

      // Current period booking
      await Booking.create({
        salonId: salon.id,
        serviceId: service.id,
        clientId: client.id,
        staffId: staff.id,
        appointmentDateTime: new Date('2024-01-20T10:00:00'),
        endTime: new Date('2024-01-20T11:00:00'),
        status: BOOKING_STATUSES.COMPLETED
      });

      // Previous period booking
      await Booking.create({
        salonId: salon.id,
        serviceId: service.id,
        clientId: client.id,
        staffId: staff.id,
        appointmentDateTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T11:00:00'),
        status: BOOKING_STATUSES.COMPLETED
      });

      const report = await FinancialReportService.getRevenueReport(
        salon.id,
        startDate,
        endDate
      );

      expect(report.periodComparison).toEqual({
        current: 100,
        previous: 100,
        percentageChange: 0,
        trend: 'STABLE'
      });
    });
  });
});

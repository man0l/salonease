const { sequelize, User, Salon, Staff, StaffAvailability } = require('../setupTests');
const staffAvailabilityController = require('../../src/controllers/staffAvailabilityController');
const { Op } = require('sequelize');

describe('Staff Availability Controller', () => {
  let salon, staff, mockReq, mockRes, owner;

  beforeEach(async () => {
    // Create a test owner (user) for the salon
    owner = await User.create({ email: 'owner@test.com', password: 'password', fullName: 'Test Owner', role: 'SalonOwner' });

    // Create a test salon with all required fields
    salon = await Salon.create({ 
      name: 'Test Salon',
      address: '123 Test St, Test City',
      contactNumber: '1234567890',
      ownerId: owner.id
    });

    // Create a test staff member
    const user = await User.create({ email: 'staff@test.com', password: 'password', fullName: 'Test Staff', role: 'Staff' });
    staff = await Staff.create({ userId: user.id, salonId: salon.id, fullName: 'Test Staff', email: 'staff@test.com' });

    // Mock request and response objects
    mockReq = {
      params: { salonId: salon.id },
      body: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn() // Add this line to mock the send method
    };
  });

  describe('getStaffAvailability', () => {
    it('should fetch staff availability for a salon', async () => {
      await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '17:00:00',
        type: 'AVAILABILITY'
      });

      await staffAvailabilityController.getStaffAvailability(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            staffId: staff.id,
            salonId: salon.id,
            dayOfWeek: 1,
            startTime: '09:00:00',
            endTime: '17:00:00',
            type: 'AVAILABILITY'
          })
        ])
      );
    });
  });

  describe('createOrUpdateStaffAvailability', () => {
    it('should create a new staff availability', async () => {
      mockReq.body = {
        staffId: staff.id,
        dayOfWeek: 2,
        startTime: '10:00:00',
        endTime: '18:00:00',
        type: 'AVAILABILITY'
      };

      await staffAvailabilityController.createOrUpdateStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          staffId: staff.id,
          salonId: salon.id,
          dayOfWeek: 2,
          startTime: '10:00:00',
          endTime: '18:00:00',
          type: 'AVAILABILITY'
        })
      );
    });

    it('should update an existing staff availability', async () => {
      const existingAvailability = await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 3,
        startTime: '09:00:00',
        endTime: '17:00:00',
        type: 'AVAILABILITY'
      });

      mockReq.body = {
        staffId: staff.id,
        dayOfWeek: 3,
        startTime: '10:00:00',
        endTime: '18:00:00',
        type: 'AVAILABILITY'
      };
      mockReq.params.availabilityId = existingAvailability.id;

      await staffAvailabilityController.createOrUpdateStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          staffId: staff.id,
          salonId: salon.id,
          dayOfWeek: 3,
          startTime: '10:00:00',
          endTime: '18:00:00',
          type: 'AVAILABILITY'
        })
      );
    });

    it('should return 400 for overlapping availability when creating new', async () => {
      await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 4,
        startTime: '09:00:00',
        endTime: '17:00:00',
        type: 'AVAILABILITY'
      });

      mockReq.body = {
        staffId: staff.id,
        dayOfWeek: 4,
        startTime: '08:00:00',
        endTime: '16:00:00',
        type: 'AVAILABILITY'
      };
      mockReq.params = { salonId: salon.id };

      await staffAvailabilityController.createOrUpdateStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Overlapping availability exists' });
    });

    it('should allow updating an existing availability', async () => {
      const existingAvailability = await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 4,
        startTime: '09:00:00',
        endTime: '17:00:00',
        type: 'AVAILABILITY'
      });

      mockReq.body = {
        staffId: staff.id,
        dayOfWeek: 4,
        startTime: '08:00:00',
        endTime: '16:00:00',
        type: 'AVAILABILITY'
      };
      mockReq.params.availabilityId = existingAvailability.id;

      await staffAvailabilityController.createOrUpdateStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          staffId: staff.id,
          salonId: salon.id,
          dayOfWeek: 4,
          startTime: '08:00:00',
          endTime: '16:00:00',
          type: 'AVAILABILITY'
        })
      );
    });

    it('should return 400 for overlapping availability with other slots when updating', async () => {
      const existingAvailability = await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 4,
        startTime: '09:00:00',
        endTime: '12:00:00',
        type: 'AVAILABILITY'
      });

      await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 4,
        startTime: '14:00:00',
        endTime: '17:00:00',
        type: 'AVAILABILITY'
      });

      mockReq.body = {
        staffId: staff.id,
        dayOfWeek: 4,
        startTime: '11:00:00',
        endTime: '15:00:00',
        type: 'AVAILABILITY'
      };
      mockReq.params.availabilityId = existingAvailability.id;

      await staffAvailabilityController.createOrUpdateStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Overlapping availability exists' });
    });
  });

  describe('deleteStaffAvailability', () => {
    it('should delete an existing staff availability', async () => {
      const availability = await StaffAvailability.create({
        staffId: staff.id,
        salonId: salon.id,
        dayOfWeek: 5,
        startTime: '09:00:00',
        endTime: '17:00:00',
        type: 'AVAILABILITY'
      });

      mockReq.params.availabilityId = availability.id;

      await staffAvailabilityController.deleteStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();

      const deletedAvailability = await StaffAvailability.findByPk(availability.id);
      expect(deletedAvailability).toBeNull();
    });

    it('should return 404 for non-existent availability', async () => {
      mockReq.params = {
        salonId: salon.id,
        availabilityId: '00000000-0000-0000-0000-000000000000' // Use a valid UUID format
      };

      await staffAvailabilityController.deleteStaffAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Availability not found' });
    });
  });
});

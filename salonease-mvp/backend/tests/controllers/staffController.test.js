const { getStaff, inviteStaff, updateStaff, deleteStaff } = require('../../src/controllers/staffController');
const { User, Salon, Staff } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const emailHelper = require('../../src/utils/helpers/emailHelper');
const { v4: uuidv4 } = require('uuid');

jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue(),
}));

describe('Staff Controller', () => {
  let req, res, salonOwner, salon;

  beforeEach(async () => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    salonOwner = await User.create({
      fullName: 'Salon Owner',
      email: 'owner@example.com',
      password: 'Password123!',
      role: 'SalonOwner',
    });

    salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: salonOwner.id,
    });
  });

  describe('getStaff', () => {
    it('should get all staff for a salon', async () => {
      await Staff.bulkCreate([
        { salonId: salon.id, email: 'staff1@example.com', fullName: 'Staff One' },
        { salonId: salon.id, email: 'staff2@example.com', fullName: 'Staff Two' },
      ]);

      req.params = { salonId: salon.id };
      req.user = { id: salonOwner.id };

      await getStaff(req, res);

      expect(res.statusCode).toBe(200);
      const responseData = res._getJSONData();
      expect(Array.isArray(responseData)).toBeTruthy();
      expect(responseData).toHaveLength(2);
      expect(responseData[0]).toHaveProperty('fullName', 'Staff One');
      expect(responseData[1]).toHaveProperty('fullName', 'Staff Two');
    });
  });

  describe('inviteStaff', () => {
    it('should invite a new staff member', async () => {
      const staffData = {
        email: 'newstaff@example.com',
        fullName: 'New Staff',
      };

      req.params = { salonId: salon.id };
      req.body = staffData;
      req.user = { id: salonOwner.id };

      const sendInvitationEmailSpy = jest.spyOn(emailHelper, 'sendInvitationEmail');

      await inviteStaff(req, res);

      expect(res.statusCode).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('email', staffData.email);
      expect(responseData).toHaveProperty('fullName', staffData.fullName);

      expect(sendInvitationEmailSpy).toHaveBeenCalledWith(
        staffData.email,
        staffData.fullName,
        salon.name
      );

      sendInvitationEmailSpy.mockRestore();
    });
  });

  describe('updateStaff', () => {
    it('should update a staff member', async () => {
      const staff = await Staff.create({
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member',
      });

      const updatedData = { fullName: 'Updated Staff Name' };

      req.params = { salonId: salon.id, staffId: staff.id };
      req.body = updatedData;
      req.user = { id: salonOwner.id };

      await updateStaff(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('fullName', updatedData.fullName);
    });

    it('should return 404 if staff does not exist', async () => {
      const nonExistentId = uuidv4(); // Generate a random UUID
      req.params = { salonId: salon.id, staffId: nonExistentId };
      req.body = { fullName: 'Updated Name' };
      req.user = { id: salonOwner.id };

      await updateStaff(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Staff not found');
    });
  });

  describe('deleteStaff', () => {
    it('should delete a staff member', async () => {
      const staff = await Staff.create({
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member',
      });

      req.params = { salonId: salon.id, staffId: staff.id };
      req.user = { id: salonOwner.id };

      await deleteStaff(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('message', 'Staff deleted successfully');

      const deletedStaff = await Staff.findByPk(staff.id);
      expect(deletedStaff).toBeNull();
    });

    it('should return 404 if staff to delete does not exist', async () => {
      const nonExistentId = uuidv4(); // Generate a random UUID
      req.params = { salonId: salon.id, staffId: nonExistentId };
      req.user = { id: salonOwner.id };

      await deleteStaff(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Staff not found');
    });
  });
});

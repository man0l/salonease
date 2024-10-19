const { getStaff, inviteStaff, updateStaff, deleteStaff, getAssociatedSalon, acceptInvitation } = require('../../src/controllers/staffController');
const { User, Salon, Staff } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const emailHelper = require('../../src/utils/helpers/emailHelper');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue(),
  sendWelcomeEmail: jest.fn().mockResolvedValue(),
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
      req.user = { id: salonOwner.id, email: 'owner@example.com' };

      await inviteStaff(req, res);

      expect(res.statusCode).toBe(201);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('email', staffData.email);
      expect(responseData).toHaveProperty('fullName', staffData.fullName);

      expect(emailHelper.sendInvitationEmail).toHaveBeenCalledWith(
        staffData.email,
        staffData.fullName,
        salon.name,
        expect.any(String)
      );
    });

    // Add more tests for error cases
    it('should return 400 if email is invalid', async () => {
      req.params = { salonId: salon.id };
      req.body = { email: 'invalid-email', fullName: 'New Staff' };
      req.user = { id: salonOwner.id, email: 'owner@example.com' };

      await inviteStaff(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('Invalid email format');
    });

    it('should return 400 if full name is missing', async () => {
      req.params = { salonId: salon.id };
      req.body = { email: 'valid@email.com' };
      req.user = { id: salonOwner.id, email: 'owner@example.com' };

      await inviteStaff(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('Full name is required');
    });

    it('should return 400 if inviting self', async () => {
      req.params = { salonId: salon.id };
      req.body = { email: 'owner@example.com', fullName: 'Owner' };
      req.user = { id: salonOwner.id, email: 'owner@example.com' };

      await inviteStaff(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('You cannot invite yourself');
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
    it('should delete a staff member and associated user', async () => {
      const staffUser = await User.create({
        fullName: 'Staff Member',
        email: 'staff@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'Staff',
      });

      const staff = await Staff.create({
        salonId: salon.id,
        userId: staffUser.id,
        email: 'staff@example.com',
        fullName: 'Staff Member',
      });

      req.params = { salonId: salon.id, staffId: staff.id };
      req.user = { id: salonOwner.id };

      await deleteStaff(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('message', 'Staff and associated user deleted successfully');

      const deletedStaff = await Staff.findByPk(staff.id);
      expect(deletedStaff).toBeNull();

      const deletedUser = await User.findByPk(staffUser.id);
      expect(deletedUser).toBeNull();
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

  describe('getAssociatedSalon', () => {
    it('should get the associated salon for a staff member', async () => {
      const staffUser = await User.create({
        fullName: 'Staff Member',
        email: 'staff@example.com',
        password: 'Password123!',
        role: 'Staff',
      });

      const staff = await Staff.create({
        salonId: salon.id,
        userId: staffUser.id,
        email: 'staff@example.com',
        fullName: 'Staff Member',
      });

      req.user = { id: staffUser.id };

      await getAssociatedSalon(req, res);

      expect(res.statusCode).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', salon.id);
      expect(responseData).toHaveProperty('name', salon.name);
      expect(responseData).toHaveProperty('address', salon.address);
      expect(responseData).toHaveProperty('contactNumber', salon.contactNumber);
    });

    it('should return 404 if staff record is not found', async () => {
      const nonExistentStaffUser = await User.create({
        fullName: 'Non-existent Staff',
        email: 'nonexistent@example.com',
        password: 'Password123!',
        role: 'Staff',
      });

      req.user = { id: nonExistentStaffUser.id };

      await getAssociatedSalon(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Staff record not found');
    });

    it('should return 404 if staff has no associated salon', async () => {
      const staffUser = await User.create({
        fullName: 'Unassigned Staff',
        email: 'unassigned@example.com',
        password: 'Password123!',
        role: 'Staff',
      });

      await Staff.create({
        userId: staffUser.id,
        email: 'unassigned@example.com',
        fullName: 'Unassigned Staff',
      });

      req.user = { id: staffUser.id };

      await getAssociatedSalon(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Associated salon not found');
    });
  });

  describe('acceptInvitation', () => {
    it('should send a welcome email when accepting an invitation', async () => {
      const token = jwt.sign(
        { email: 'staff@example.com', salonId: salon.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const staff = await Staff.create({
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member',
        invitationToken: token
      });

      req.body = {
        token: token,
        password: 'NewPassword123!'
      };

      await acceptInvitation(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('message', 'Invitation accepted successfully');

      expect(emailHelper.sendWelcomeEmail).toHaveBeenCalledWith(
        'staff@example.com',
        'Staff Member',
        salon.name
      );

      // Verify that the staff record was updated
      const updatedStaff = await Staff.findByPk(staff.id);
      expect(updatedStaff.isActive).toBe(true);
      expect(updatedStaff.invitationToken).toBeNull();

      // Verify that a new user was created
      const newUser = await User.findOne({ where: { email: 'staff@example.com' } });
      expect(newUser).not.toBeNull();
      expect(newUser.fullName).toBe('Staff Member');
      expect(newUser.role).toBe('Staff');
      expect(newUser.isEmailVerified).toBe(true);

      // Verify that the password was hashed
      const isPasswordValid = await bcrypt.compare('NewPassword123!', newUser.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should return 404 if invitation token is invalid', async () => {
      req.body = {
        token: 'invalid_token',
        password: 'NewPassword123!'
      };

      await acceptInvitation(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Invalid invitation');
    });

    it('should return 400 if invitation has expired', async () => {
      const expiredToken = jwt.sign(
        { email: 'staff@example.com', salonId: salon.id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' } // Expired immediately
      );

      await Staff.create({
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member',
        invitationToken: expiredToken
      });

      // Wait for a moment to ensure the token has expired
      await new Promise(resolve => setTimeout(resolve, 1000));

      req.body = {
        token: expiredToken,
        password: 'NewPassword123!'
      };

      await acceptInvitation(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Invitation has expired');
    });
  });
});

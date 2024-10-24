const request = require('supertest');
const app = require('../../src/app');
const { User, Salon, Staff, sequelize } = require('../setupTests');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailHelper = require('../../src/utils/helpers/emailHelper');
const { v4: uuidv4 } = require('uuid');
const ROLES = require('../../src/config/roles');

jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendInvitationEmail: jest.fn(),
}));

describe('Staff Routes', () => {
  let token;
  let user;
  let salon;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    user = await User.create({
      id: uuidv4(),
      fullName: 'Test Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: ROLES.SALON_OWNER,
      isEmailVerified: true
    });
    salon = await Salon.create({
      id: uuidv4(),
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: user.id
    });
    token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
  });

  describe('GET /api/staff/:salonId', () => {
    it('should get all staff for a salon', async () => {
      await Staff.bulkCreate([
        { id: uuidv4(), salonId: salon.id, email: 'staff1@example.com', fullName: 'Staff One' },
        { id: uuidv4(), salonId: salon.id, email: 'staff2@example.com', fullName: 'Staff Two' }
      ]);

      const response = await request(app)
        .get(`/api/staff/${salon.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('fullName', 'Staff One');
      expect(response.body[1]).toHaveProperty('fullName', 'Staff Two');
    });
  });

  describe('POST /api/staff/:salonId/invite', () => {
    it('should invite a new staff member', async () => {
      const staffData = {
        email: 'newstaff@example.com',
        fullName: 'New Staff'
      };

      const response = await request(app)
        .post(`/api/staff/${salon.id}/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send(staffData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('email', staffData.email);
      expect(response.body).toHaveProperty('fullName', staffData.fullName);

      expect(emailHelper.sendInvitationEmail).toHaveBeenCalledWith(
        staffData.email,
        staffData.fullName,
        salon.name,
        expect.any(String) // Expect the fourth argument to be a string (invitation token)
      );
    });

    it('should return 400 if staff data is invalid', async () => {
      const response = await request(app)
        .post(`/api/staff/${salon.id}/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'invalid-email' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Invalid email format');
    });

    it('should return 400 if full name is missing', async () => {
      const response = await request(app)
        .post(`/api/staff/${salon.id}/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'valid@email.com' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Full name is required');
    });
  });

  describe('PUT /api/staff/:salonId/:staffId', () => {
    it('should update a staff member', async () => {
      const staff = await Staff.create({
        id: uuidv4(),
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member'
      });

      const response = await request(app)
        .put(`/api/staff/${salon.id}/${staff.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'Updated Staff Name' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('fullName', 'Updated Staff Name');

      const updatedStaff = await Staff.findByPk(staff.id);
      expect(updatedStaff.fullName).toBe('Updated Staff Name');
    });

    it('should return 404 if staff does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .put(`/api/staff/${salon.id}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'Updated Name' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Staff not found');
    });
  });

  describe('DELETE /api/staff/:salonId/staff/:staffId', () => {
    it('should delete a staff member and associated user', async () => {
      const user = await User.create({
        id: uuidv4(),
        fullName: 'Staff Member',
        email: 'staff@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'Staff',
        isEmailVerified: true
      });

      const staff = await Staff.create({
        id: uuidv4(),
        salonId: salon.id,
        userId: user.id,
        email: 'staff@example.com',
        fullName: 'Staff Member'
      });

      const response = await request(app)
        .delete(`/api/staff/${salon.id}/staff/${staff.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Staff and associated user deleted successfully');

      const deletedStaff = await Staff.findByPk(staff.id);
      expect(deletedStaff).toBeNull();

      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 if staff to delete does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .delete(`/api/staff/${salon.id}/staff/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Staff not found');
    });
  });

  describe('GET /api/staff/my-salon', () => {
    it('should get the associated salon for a staff member', async () => {
      const staffUser = await User.create({
        id: uuidv4(),
        fullName: 'Staff Member',
        email: 'staff@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: ROLES.STAFF,
        isEmailVerified: true
      });

      await Staff.create({
        id: uuidv4(),
        salonId: salon.id,
        userId: staffUser.id,
        email: 'staff@example.com',
        fullName: 'Staff Member'
      });

      const staffToken = jwt.sign({ userId: staffUser.id, role: staffUser.role }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/staff/my-salon')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', salon.id);
      expect(response.body).toHaveProperty('name', salon.name);
      expect(response.body).toHaveProperty('address', salon.address);
      expect(response.body).toHaveProperty('contactNumber', salon.contactNumber);
    });

    it('should return 404 if staff record is not found', async () => {
      const nonExistentStaffUser = await User.create({
        id: uuidv4(),
        fullName: 'Non-existent Staff',
        email: 'nonexistent@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: ROLES.STAFF,
        isEmailVerified: true
      });

      const nonExistentStaffToken = jwt.sign({ userId: nonExistentStaffUser.id, role: nonExistentStaffUser.role }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/staff/my-salon')
        .set('Authorization', `Bearer ${nonExistentStaffToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Staff record not found');
    });

    it('should return 404 if staff has no associated salon', async () => {
      const staffUser = await User.create({
        id: uuidv4(),
        fullName: 'Unassigned Staff',
        email: 'unassigned@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: ROLES.STAFF,
        isEmailVerified: true
      });

      await Staff.create({
        id: uuidv4(),
        userId: staffUser.id,
        email: 'unassigned@example.com',
        fullName: 'Unassigned Staff'
      });

      const staffToken = jwt.sign({ userId: staffUser.id, role: staffUser.role }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/staff/my-salon')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Associated salon not found');
    });
  });
});

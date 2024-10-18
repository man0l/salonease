const request = require('supertest');
const app = require('../../src/app');
const { User, Salon, Staff, sequelize } = require('../setupTests');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailHelper = require('../../src/utils/helpers/emailHelper');
const { v4: uuidv4 } = require('uuid');

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
      role: 'SalonOwner',
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

  describe('GET /api/salons/:salonId/staff', () => {
    it('should get all staff for a salon', async () => {
      await Staff.bulkCreate([
        { id: uuidv4(), salonId: salon.id, email: 'staff1@example.com', fullName: 'Staff One' },
        { id: uuidv4(), salonId: salon.id, email: 'staff2@example.com', fullName: 'Staff Two' }
      ]);

      const response = await request(app)
        .get(`/api/salons/${salon.id}/staff`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('fullName', 'Staff One');
      expect(response.body[1]).toHaveProperty('fullName', 'Staff Two');
    });
  });

  describe('POST /api/salons/:salonId/staff/invite', () => {
    it('should invite a new staff member', async () => {
      const staffData = {
        email: 'newstaff@example.com',
        fullName: 'New Staff'
      };

      const response = await request(app)
        .post(`/api/salons/${salon.id}/staff/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send(staffData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('email', staffData.email);
      expect(response.body).toHaveProperty('fullName', staffData.fullName);

      expect(emailHelper.sendInvitationEmail).toHaveBeenCalledWith(
        staffData.email,
        staffData.fullName,
        salon.name
      );
    });

    it('should return 400 if staff data is invalid', async () => {
      const response = await request(app)
        .post(`/api/salons/${salon.id}/staff/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'invalid-email' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Invalid email format');
    });

    it('should return 400 if full name is missing', async () => {
      const response = await request(app)
        .post(`/api/salons/${salon.id}/staff/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'valid@email.com' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Full name is required');
    });
  });

  describe('PUT /api/salons/:salonId/staff/:staffId', () => {
    it('should update a staff member', async () => {
      const staff = await Staff.create({
        id: uuidv4(),
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member'
      });

      const response = await request(app)
        .put(`/api/salons/${salon.id}/staff/${staff.id}`)
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
        .put(`/api/salons/${salon.id}/staff/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'Updated Name' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Staff not found');
    });
  });

  describe('DELETE /api/salons/:salonId/staff/:staffId', () => {
    it('should delete a staff member', async () => {
      const staff = await Staff.create({
        id: uuidv4(),
        salonId: salon.id,
        email: 'staff@example.com',
        fullName: 'Staff Member'
      });

      const response = await request(app)
        .delete(`/api/salons/${salon.id}/staff/${staff.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Staff deleted successfully');

      const deletedStaff = await Staff.findByPk(staff.id);
      expect(deletedStaff).toBeNull();
    });

    it('should return 404 if staff to delete does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .delete(`/api/salons/${salon.id}/staff/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Staff not found');
    });
  });
});

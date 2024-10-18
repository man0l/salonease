const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Salon, Staff } = require('../src/config/db');
const { sendInvitationEmail } = require('../src/utils/emailHelper');

jest.mock('../src/utils/emailHelper');

describe('Staff Controller', () => {
  let token;
  let salonId;
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = loginResponse.body.token;

    // Create a test salon
    const salonResponse = await request(app)
      .post('/api/salons')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Salon', address: '123 Test St', contactNumber: '1234567890' });
    salonId = salonResponse.body.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Staff.destroy({ where: {} });
  });

  describe('GET /:salonId/staff', () => {
    it('should get all staff for a salon', async () => {
      await Staff.bulkCreate([
        { salonId, email: 'staff1@example.com', fullName: 'Staff One', role: 'stylist' },
        { salonId, email: 'staff2@example.com', fullName: 'Staff Two', role: 'manager' },
      ]);

      const response = await request(app)
        .get(`/api/salons/${salonId}/staff`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].fullName).toBe('Staff One');
      expect(response.body[1].fullName).toBe('Staff Two');
    });
  });

  describe('POST /:salonId/staff/invite', () => {
    it('should invite a new staff member', async () => {
      const staffData = {
        email: 'newstaff@example.com',
        fullName: 'New Staff',
        role: 'stylist',
      };

      const response = await request(app)
        .post(`/api/salons/${salonId}/staff/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send(staffData);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(staffData.email);
      expect(response.body.fullName).toBe(staffData.fullName);
      expect(response.body.role).toBe(staffData.role);

      expect(sendInvitationEmail).toHaveBeenCalledWith(
        staffData.email,
        staffData.fullName,
        'Test Salon'
      );
    });
  });

  describe('PUT /:salonId/staff/:staffId', () => {
    it('should update a staff member', async () => {
      const staff = await Staff.create({
        salonId,
        email: 'staff@example.com',
        fullName: 'Staff Member',
        role: 'stylist',
      });

      const updatedData = { role: 'manager' };

      const response = await request(app)
        .put(`/api/salons/${salonId}/staff/${staff.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.role).toBe(updatedData.role);
    });
  });

  describe('DELETE /:salonId/staff/:staffId', () => {
    it('should delete a staff member', async () => {
      const staff = await Staff.create({
        salonId,
        email: 'staff@example.com',
        fullName: 'Staff Member',
        role: 'stylist',
      });

      const response = await request(app)
        .delete(`/api/salons/${salonId}/staff/${staff.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Staff deleted successfully');

      const deletedStaff = await Staff.findByPk(staff.id);
      expect(deletedStaff).toBeNull();
    });
  });
});

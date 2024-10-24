const request = require('supertest');
const app = require('../../src/app');
const { User, Salon, sequelize } = require('../setupTests');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

describe('Salon Routes', () => {
  let token;
  let user;


  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    user = await User.create({
      fullName: 'Test Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: 'SalonOwner',
      isEmailVerified: true
    });
    token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
  });

  describe('POST /api/salons', () => {
    it('should create a new salon successfully', async () => {
      const response = await request(app)
        .post('/api/salons')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Salon',
          address: '123 Test St',
          contactNumber: '1234567890'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('name', 'Test Salon');
      expect(response.body).toHaveProperty('ownerId', user.id);

      const newSalon = await Salon.findOne({ where: { name: 'Test Salon' } });
      expect(newSalon).not.toBeNull();
    });

    it('should return 400 if salon data is invalid', async () => {
      const response = await request(app)
        .post('/api/salons')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Name is required');
      expect(response.body.message).toContain('Address is required');
      expect(response.body.message).toContain('Contact number is required');
    });
  });

  describe('GET /api/salons', () => {
    it('should get all salons for the user', async () => {
      await Salon.bulkCreate([
        { name: 'Salon 1', address: '123 Test St', contactNumber: '1234567890', ownerId: user.id },
        { name: 'Salon 2', address: '456 Test Ave', contactNumber: '0987654321', ownerId: user.id }
      ]);

      const response = await request(app)
        .get('/api/salons')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.salons).toHaveLength(2);
      expect(response.body.totalItems).toBe(2);
    });
  });

  describe('PUT /api/salons/:id', () => {
    it('should update an existing salon', async () => {
      const salon = await Salon.create({
        name: 'Old Salon',
        address: '789 Test Blvd',
        contactNumber: '1122334455',
        ownerId: user.id
      });

      const response = await request(app)
        .put(`/api/salons/${salon.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Salon',
          address: 'New Address'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Salon');
      expect(response.body).toHaveProperty('address', 'New Address');

      const updatedSalon = await Salon.findByPk(salon.id);
      expect(updatedSalon.name).toBe('Updated Salon');
    });

    it('should return 404 if salon does not exist', async () => {
      const nonExistentId = uuidv4();  // Generate a random UUID
      const response = await request(app)
        .put(`/api/salons/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Salon' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Salon not found');
    });
  });

  describe('DELETE /api/salons/:id', () => {
    it('should delete an existing salon', async () => {
      const salon = await Salon.create({
        name: 'Salon to Delete',
        address: '999 Delete St',
        contactNumber: '9876543210',
        ownerId: user.id
      });

      const response = await request(app)
        .delete(`/api/salons/${salon.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);

      const deletedSalon = await Salon.findByPk(salon.id);
      expect(deletedSalon).toBeNull();
    });

    it('should return 404 if salon to delete does not exist', async () => {
      const nonExistentId = uuidv4();  // Generate a random UUID
      const response = await request(app)
        .delete(`/api/salons/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Salon not found');
    });
  });
});

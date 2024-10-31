const { createSalon, getSalons, updateSalon, deleteSalon } = require('../../src/controllers/salonController');
const { Salon, User } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const { v4: uuidv4 } = require('uuid');

describe('Salon Controller', () => {
  let req, res, testUser;

  beforeEach(async () => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'SalonOwner',
    });
  });

  describe('createSalon', () => {
    it('should create a new salon successfully', async () => {
      const user = await User.create({
        fullName: 'Salon Owner',
        email: 'owner@example.com',
        password: 'Password123!',
        role: 'SalonOwner',
      });

      req.body = {
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '1234567890',
      };
      req.user = { id: user.id };

      await createSalon(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toHaveProperty('name', 'Test Salon');
      expect(res._getJSONData()).toHaveProperty('ownerId', user.id);

      const newSalon = await Salon.findOne({ where: { name: 'Test Salon' } });
      expect(newSalon).not.toBeNull();
    });

    it('should return 400 if salon data is invalid', async () => {
      req.body = { name: '' };
      req.user = { id: testUser.id };

      await createSalon(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('Name is required');
      expect(res._getJSONData().errors).toContain('"address" is required');
      expect(res._getJSONData().errors).toContain('"contactNumber" is required');
    });

    it('should return 400 if name is too long', async () => {
      req.body = {
        name: 'a'.repeat(256),
        address: '123 Test St',
        contactNumber: '1234567890',
      };
      req.user = { id: testUser.id };

      await createSalon(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('Name cannot exceed 255 characters');
    });

    it('should return 400 if contact number is invalid', async () => {
      req.body = {
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '123',
      };
      req.user = { id: testUser.id };

      await createSalon(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('Contact number must be between 5 and 20 digits');
    });
  });

  describe('getSalons', () => {
    it('should return salons for the user', async () => {
      const user = await User.create({
        fullName: 'Salon Owner',
        email: 'owner2@example.com',
        password: 'Password123!',
        role: 'SalonOwner',
      });

      await Salon.bulkCreate([
        { name: 'Salon 1', address: '123 Test St', contactNumber: '1234567890', ownerId: user.id },
        { name: 'Salon 2', address: '456 Test Ave', contactNumber: '0987654321', ownerId: user.id },
      ]);

      req.user = { id: user.id };

      await getSalons(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().salons).toHaveLength(2);
      expect(res._getJSONData().totalItems).toBe(2);
    });

    it('should return empty array if user has no salons', async () => {
      const user = await User.create({
        fullName: 'New Owner',
        email: 'newowner@example.com',
        password: 'Password123!',
        role: 'SalonOwner',
      });

      req.user = { id: user.id };

      await getSalons(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().salons).toHaveLength(0);
      expect(res._getJSONData().totalItems).toBe(0);
    });
  });

  describe('updateSalon', () => {
    it('should update an existing salon', async () => {
      const salon = await Salon.create({
        name: 'Original Salon',
        address: '789 Test Blvd',
        contactNumber: '1122334455',
        ownerId: testUser.id,
      });

      req.params = { id: salon.id };
      req.body = { name: 'Updated Salon', address: 'New Address' };
      req.user = { id: testUser.id };

      await updateSalon(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('name', 'Updated Salon');
      expect(res._getJSONData()).toHaveProperty('address', 'New Address');

      const updatedSalon = await Salon.findByPk(salon.id);
      expect(updatedSalon.name).toBe('Updated Salon');
    });

    it('should return 404 if salon does not exist', async () => {
      const nonExistentId = uuidv4();
      req.params = { id: nonExistentId };
      req.body = { name: 'Updated Salon' };
      req.user = { id: testUser.id };

      await updateSalon(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Salon not found');
    });

    it('should return 400 if update data is invalid', async () => {
      const salon = await Salon.create({
        name: 'Original Salon',
        address: '789 Test Blvd',
        contactNumber: '1122334455',
        ownerId: testUser.id,
      });

      req.params = { id: salon.id };
      req.body = { name: '', contactNumber: '123' };
      req.user = { id: testUser.id };

      await updateSalon(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Validation error');
      expect(res._getJSONData().errors).toContain('Name is required');
      expect(res._getJSONData().errors).toContain('Contact number must be between 5 and 20 digits');
    });
  });

  describe('deleteSalon', () => {
    it('should delete an existing salon', async () => {
      const salon = await Salon.create({
        name: 'Salon to Delete',
        address: '999 Delete St',
        contactNumber: '9876543210',
        ownerId: testUser.id,
      });

      req.params = { id: salon.id };
      req.user = { id: testUser.id };

      await deleteSalon(req, res);

      expect(res.statusCode).toBe(204);

      const deletedSalon = await Salon.findByPk(salon.id);
      expect(deletedSalon).toBeNull();
    });

    it('should return 404 if salon to delete does not exist', async () => {
      const nonExistentId = uuidv4();
      req.params = { id: nonExistentId };
      req.user = { id: testUser.id };

      await deleteSalon(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Salon not found');
    });
  });
});

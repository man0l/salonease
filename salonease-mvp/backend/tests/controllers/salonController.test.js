const { createSalon, getSalons, updateSalon, deleteSalon } = require('../../src/controllers/salonController');
const { Salon, User, SalonImage, sequelize } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const { v4: uuidv4 } = require('uuid');

// Mock imageUpload module
jest.mock('../../src/utils/imageUpload', () => ({
  uploadMultiple: jest.fn().mockImplementation(() => (req, res, next) => {
    req.files = [{
      filename: 'test-image-1.jpg',
      fieldname: 'salonImages',
      originalname: 'test-image-1.jpg'
    }, {
      filename: 'test-image-2.jpg',
      fieldname: 'salonImages',
      originalname: 'test-image-2.jpg'
    }];
    next();
  }),
  getImageUrl: jest.fn().mockImplementation((filename, folder) => {
    return `/uploads/${folder}/${filename}`;
  })
}));

describe('Salon Controller', () => {
  let req, res, testUser;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    req = httpMocks.createRequest();
    res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });

    testUser = await User.create({
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`, // Make email unique
      password: 'password123',
      role: 'SalonOwner',
    });
  });

  afterEach(async () => {
    // Restore all mocks
    jest.restoreAllMocks();
    
    // Clear any mocked implementations
    if (SalonImage.bulkCreate.mockRestore) {
      SalonImage.bulkCreate.mockRestore();
    }
    if (Salon.findOne.mockRestore) {
      Salon.findOne.mockRestore();
    }

  });

  afterAll(async () => {
    await sequelize.close();
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

    it('should create salon with images successfully', async () => {
      req.user = { id: testUser.id };
      req.files = [{
        filename: 'test-image-1.jpg',
        fieldname: 'salonImages',
        originalname: 'test-image-1.jpg'
      }, {
        filename: 'test-image-2.jpg',
        fieldname: 'salonImages',
        originalname: 'test-image-2.jpg'
      }];
      req.body = {
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '1234567890',
        captions: ['Image 1', 'Image 2']
      };

      // Mock SalonImage.create instead of bulkCreate
      const mockSalonImage = {
        id: uuidv4(),
        salonId: null,
        imageUrl: '/uploads/salons/test-image-1.jpg',
        caption: 'Image 1'
      };

      jest.spyOn(SalonImage, 'create').mockResolvedValue(mockSalonImage);

      await createSalon(req, res);

      expect(res.statusCode).toBe(201);
      expect(SalonImage.create).toHaveBeenCalled();
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

      // Mock Salon.findOne to return the salon with update method
      const mockSalon = {
        ...salon.toJSON(),
        update: jest.fn().mockImplementation(async (data, options) => {
          // Ignore the options/transaction object in the implementation
          return { ...salon.toJSON(), ...data };
        })
      };
      
      jest.spyOn(Salon, 'findOne').mockResolvedValue(mockSalon);

      await updateSalon(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockSalon.update.mock.calls[0][0]).toEqual({
        name: 'Updated Salon',
        address: 'New Address'
      });
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

    it('should handle errors during update', async () => {
      const salon = await Salon.create({
        name: 'Original Salon',
        address: '789 Test Blvd',
        contactNumber: '1122334455',
        ownerId: testUser.id,
      });

      req.params = { id: salon.id };
      req.body = { name: 'Updated Salon' };
      req.user = { id: testUser.id };

      // Mock Salon.findOne to throw an error
      const mockError = new Error('Database error');
      jest.spyOn(Salon, 'findOne').mockRejectedValue(mockError);

      await updateSalon(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toHaveProperty('message', 'Error updating salon');
      expect(res._getJSONData().error).toBe(mockError.message);
    });
  });

  describe('deleteSalon', () => {
    it('should soft delete an existing salon', async () => {
      const salon = await Salon.create({
        name: 'Salon to Delete',
        address: '999 Delete St',
        contactNumber: '9876543210',
        ownerId: testUser.id,
      });

      req.params = { id: salon.id };
      req.user = { id: testUser.id };

      // Mock the destroy method instead of findOne
      jest.spyOn(Salon.prototype, 'destroy').mockResolvedValue(1);

      await deleteSalon(req, res);

      expect(res.statusCode).toBe(204);
      expect(Salon.prototype.destroy).toHaveBeenCalled();
    });

    it('should hard delete when force parameter is true', async () => {
      const salon = await Salon.create({
        name: 'Salon to Force Delete',
        address: '999 Delete St',
        contactNumber: '9876543210',
        ownerId: testUser.id,
      });

      req.params = { id: salon.id };
      req.query = { force: 'true' };
      req.user = { id: testUser.id };

      await deleteSalon(req, res);

      expect(res.statusCode).toBe(204);

      // Verify it's completely deleted
      const deletedSalon = await Salon.findOne({
        where: { id: salon.id },
        paranoid: false
      });
      expect(deletedSalon).toBeNull();
    });
  });

});

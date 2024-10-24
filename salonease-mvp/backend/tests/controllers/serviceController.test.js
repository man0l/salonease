const { createService, getServices, updateService, deleteService } = require('../../src/controllers/serviceController');
const { Service, Salon, Category, User } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const { v4: uuidv4 } = require('uuid');

describe('Service Controller', () => {
  let req, res, testSalon, testCategory, testOwner;

  beforeEach(async () => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    testOwner = await User.create({
      fullName: 'Test Owner',
      email: 'owner@example.com',
      password: 'password123',
      role: 'SalonOwner'
    });

    testSalon = await Salon.create({
      name: 'Test Salon',
      address: 'Test Address',
      contactNumber: '1234567890',
      ownerId: testOwner.id
    });

    testCategory = await Category.create({
      name: 'Test Category',
    });
  });

  describe('createService', () => {
    it('should create a new service successfully', async () => {
      req.params = { salonId: testSalon.id };
      req.body = {
        name: 'Haircut',
        categoryId: testCategory.id,
        price: 50.00,
        duration: 30,
      };

      await createService(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toHaveProperty('name', 'Haircut');
      expect(res._getJSONData()).toHaveProperty('salonId', testSalon.id);
      expect(res._getJSONData()).toHaveProperty('categoryId', testCategory.id);

      const newService = await Service.findOne({ where: { name: 'Haircut' } });
      expect(newService).not.toBeNull();
    });

    it('should return 400 if service data is invalid', async () => {
      req.body = { name: '' };

      await createService(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message');
    });

    it('should return 400 if categoryId is not a number', async () => {
      req.body = {
        name: 'Test Service',
        categoryId: 'not a number',
        price: 50,
        duration: 60
      };

      await createService(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message');
      expect(res._getJSONData().message).toContain('"categoryId" must be a number');
    });

    it('should return 400 if category does not exist', async () => {
      req.body = {
        name: 'Test Service',
        categoryId: 9999, // Assuming this category doesn't exist
        price: 50,
        duration: 60
      };

      await createService(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Invalid category');
    });
  });

  describe('getServices', () => {
    it('should return services for the salon with category information', async () => {
      await Service.bulkCreate([
        { salonId: testSalon.id, name: 'Service 1', categoryId: testCategory.id, price: 50.00, duration: 30 },
        { salonId: testSalon.id, name: 'Service 2', categoryId: testCategory.id, price: 30.00, duration: 45 },
      ]);

      req.params = { salonId: testSalon.id };

      await getServices(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveLength(2);
      expect(res._getJSONData()[0]).toHaveProperty('category');
      expect(res._getJSONData()[0].category).toHaveProperty('name', 'Test Category');
    });
  });

  describe('updateService', () => {
    it('should update an existing service', async () => {
      const service = await Service.create({
        salonId: testSalon.id,
        name: 'Original Service',
        categoryId: testCategory.id,
        price: 40.00,
        duration: 30,
      });

      const newCategory = await Category.create({ name: 'New Category' });

      req.params = { id: service.id };
      req.body = { name: 'Updated Service', price: 45.00, categoryId: newCategory.id };

      await updateService(req, res);

      if (res.statusCode === 400) {
        console.log('Error response:', res._getJSONData());
      }

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('name', 'Updated Service');
      expect(res._getJSONData()).toHaveProperty('price', 45.00);
      expect(res._getJSONData()).toHaveProperty('categoryId', newCategory.id);

      const updatedService = await Service.findByPk(service.id);
      expect(updatedService.name).toBe('Updated Service');
      expect(updatedService.categoryId).toBe(newCategory.id);
    });
  });

  describe('deleteService', () => {
    it('should delete an existing service', async () => {
      const service = await Service.create({
        salonId: testSalon.id,
        name: 'Service to Delete',
        categoryId: testCategory.id,
        price: 35.00,
        duration: 60,
      });

      req.params = { id: service.id };

      await deleteService(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('message', 'Service deleted successfully');

      const deletedService = await Service.findByPk(service.id);
      expect(deletedService).toBeNull();
    });

    it('should return 404 if service to delete does not exist', async () => {
      const nonExistentId = uuidv4();
      req.params = { id: nonExistentId };

      await deleteService(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Service not found');
    });
  });
});

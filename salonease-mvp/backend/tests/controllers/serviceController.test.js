const { createService, getServices, updateService, deleteService } = require('../../src/controllers/serviceController');
const { Service, Salon } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const { v4: uuidv4 } = require('uuid');

describe('Service Controller', () => {
  let req, res, testSalon;

  beforeEach(async () => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    testSalon = await Salon.create({
      name: 'Test Salon',
      address: 'Test Address',
      contactNumber: '1234567890',
    });
  });

  describe('createService', () => {
    it('should create a new service successfully', async () => {
      req.body = {
        salonId: testSalon.id,
        name: 'Haircut',
        category: 'Hair',
        price: 50.00,
        duration: 30,
      };

      await createService(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toHaveProperty('name', 'Haircut');
      expect(res._getJSONData()).toHaveProperty('salonId', testSalon.id);

      const newService = await Service.findOne({ where: { name: 'Haircut' } });
      expect(newService).not.toBeNull();
    });

    it('should return 400 if service data is invalid', async () => {
      req.body = { name: '' };

      await createService(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message');
    });
  });

  describe('getServices', () => {
    it('should return services for the salon', async () => {
      await Service.bulkCreate([
        { salonId: testSalon.id, name: 'Service 1', category: 'Hair', price: 50.00, duration: 30 },
        { salonId: testSalon.id, name: 'Service 2', category: 'Nails', price: 30.00, duration: 45 },
      ]);

      req.params = { salonId: testSalon.id };

      await getServices(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveLength(2);
    });

    it('should return empty array if salon has no services', async () => {
      req.params = { salonId: testSalon.id };

      await getServices(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveLength(0);
    });
  });

  describe('updateService', () => {
    it('should update an existing service', async () => {
      const service = await Service.create({
        salonId: testSalon.id,
        name: 'Original Service',
        category: 'Hair',
        price: 40.00,
        duration: 30,
      });

      req.params = { id: service.id };
      req.body = { name: 'Updated Service', price: 45.00 };

      await updateService(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('name', 'Updated Service');
      expect(res._getJSONData()).toHaveProperty('price', '45.00');

      const updatedService = await Service.findByPk(service.id);
      expect(updatedService.name).toBe('Updated Service');
    });

    it('should return 404 if service does not exist', async () => {
      const nonExistentId = uuidv4();
      req.params = { id: nonExistentId };
      req.body = { name: 'Updated Service' };

      await updateService(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Service not found');
    });
  });

  describe('deleteService', () => {
    it('should delete an existing service', async () => {
      const service = await Service.create({
        salonId: testSalon.id,
        name: 'Service to Delete',
        category: 'Nails',
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

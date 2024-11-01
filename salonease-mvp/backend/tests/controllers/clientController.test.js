const { getClients, getClient, updateClient, exportClients, addClient, deleteClient } = require('../../src/controllers/clientController');
const { Client, Salon, User } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const { v4: uuidv4 } = require('uuid');

describe('Client Controller', () => {
  let req, res, testSalon, testOwner;

  beforeEach(async () => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    testOwner = await User.create({
      fullName: 'Test Owner',
      email: 'owner@test.com',
      password: 'password123',
      role: 'SalonOwner',
    });

    testSalon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: testOwner.id,
    });
  });

  describe('getClients', () => {
    it('should fetch all clients for a salon', async () => {
      await Client.bulkCreate([
        { salonId: testSalon.id, name: 'Client 1', email: 'client1@test.com' },
        { salonId: testSalon.id, name: 'Client 2', email: 'client2@test.com' },
      ]);

      req.params = { salonId: testSalon.id };

      await getClients(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveLength(2);
      expect(res._getJSONData()[0]).toHaveProperty('name', 'Client 1');
      expect(res._getJSONData()[1]).toHaveProperty('name', 'Client 2');
    });

    it('should return an empty array if no clients exist', async () => {
      req.params = { salonId: testSalon.id };

      await getClients(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveLength(0);
    });

    it('should handle pagination correctly', async () => {
      // Create 15 test clients
      const clients = Array.from({ length: 15 }, (_, i) => ({
        salonId: testSalon.id,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@test.com`
      }));
      await Client.bulkCreate(clients);

      req.params = { salonId: testSalon.id };
      req.query = { page: 1, limit: 10 };

      await getClients(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveLength(10);
      expect(res._getHeaders()).toHaveProperty('x-total-count', '15');
    });
  });

  describe('getClient', () => {
    it('should fetch a specific client', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Test Client',
        email: 'testclient@test.com',
      });

      req.params = { salonId: testSalon.id, clientId: client.id };

      await getClient(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('name', 'Test Client');
      expect(res._getJSONData()).toHaveProperty('email', 'testclient@test.com');
    });

    it('should return 404 if client is not found', async () => {
      req.params = { salonId: testSalon.id, clientId: uuidv4() };

      await getClient(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Client not found');
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Old Name',
        email: 'old@test.com',
      });

      req.params = { salonId: testSalon.id, clientId: client.id };
      req.body = {
        name: 'New Name',
        email: 'new@test.com',
        phone: '9876543210',
        notes: 'Updated notes',
      };

      await updateClient(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('name', 'New Name');
      expect(res._getJSONData()).toHaveProperty('email', 'new@test.com');
      expect(res._getJSONData()).toHaveProperty('phone', '9876543210');
      expect(res._getJSONData()).toHaveProperty('notes', 'Updated notes');
    });

    it('should return 404 if client to update is not found', async () => {
      req.params = { salonId: testSalon.id, clientId: uuidv4() };
      req.body = { name: 'New Name' };

      await updateClient(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Client not found');
    });

    it('should return 400 if email is invalid during update', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Old Name',
        email: 'old@test.com',
      });

      req.params = { salonId: testSalon.id, clientId: client.id };
      req.body = {
        email: 'invalid-email',
      };

      await updateClient(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Email is invalid');
    });

    it('should return 400 if phone number contains non-digit characters during update', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Old Name',
        email: 'old@test.com',
      });

      req.params = { salonId: testSalon.id, clientId: client.id };
      req.body = {
        phone: '123-456-7890',
      };

      await updateClient(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Phone number must contain only digits');
    });

    it('should return 400 if no fields are provided for update', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Old Name',
        email: 'old@test.com',
      });

      req.params = { salonId: testSalon.id, clientId: client.id };
      req.body = {};

      await updateClient(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'At least one field must be provided for update');
    });
  });

  describe('exportClients', () => {
    it('should export clients as CSV', async () => {
      await Client.bulkCreate([
        { salonId: testSalon.id, name: 'Client 1', email: 'client1@test.com', phone: '1111111111' },
        { salonId: testSalon.id, name: 'Client 2', email: 'client2@test.com' },
      ]);

      req.params = { salonId: testSalon.id };

      await exportClients(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getHeaders()['content-type']).toBe('text/csv');
      expect(res._getHeaders()['content-disposition']).toBe('attachment; filename=clients.csv');
      expect(res._getData()).toBe('Client 1,client1@test.com,1111111111\nClient 2,client2@test.com,No phone number');
    });
  });

  describe('addClient', () => {
    it('should add a new client', async () => {
      req.params = { salonId: testSalon.id };
      req.body = {
        name: 'New Client',
        email: 'newclient@test.com',
        phone: '1234567890',
        notes: 'Test notes',
      };

      await addClient(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toHaveProperty('name', 'New Client');
      expect(res._getJSONData()).toHaveProperty('email', 'newclient@test.com');
      expect(res._getJSONData()).toHaveProperty('phone', '1234567890');
      expect(res._getJSONData()).toHaveProperty('notes', 'Test notes');
    });

    it('should return 500 if there is an error adding the client', async () => {
      // Mock Client.create to throw an error
      const mockError = new Error('Database connection failed');
      jest.spyOn(Client, 'create').mockRejectedValue(mockError);

      req.params = { salonId: testSalon.id };
      req.body = {
        name: 'New Client',
        email: 'newclient@test.com',
        phone: '1234567890',
      };

      await addClient(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toHaveProperty('message', 'Error adding client');
      expect(res._getJSONData().error).toBe(mockError.message);

      // Restore the original implementation
      jest.spyOn(Client, 'create').mockRestore();
    });

    it('should return 400 if name is missing', async () => {
      req.params = { salonId: testSalon.id };
      req.body = {
        email: 'newclient@test.com',
        phone: '1234567890',
      };

      await addClient(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Name is required');
    });

    it('should return 400 if email is invalid', async () => {
      req.params = { salonId: testSalon.id };
      req.body = {
        name: 'New Client',
        email: 'invalid-email',
        phone: '1234567890',
      };

      await addClient(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Email is invalid');
    });

    it('should return 400 if phone number contains non-digit characters', async () => {
      req.params = { salonId: testSalon.id };
      req.body = {
        name: 'New Client',
        email: 'newclient@test.com',
        phone: '123-456-7890',
      };

      await addClient(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message', 'Phone number must contain only digits');
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Client to Delete',
        email: 'delete@test.com',
        phone: '1234567890'
      });

      req.params = { salonId: testSalon.id, clientId: client.id };

      await deleteClient(req, res);

      expect(res.statusCode).toBe(204);

      const deletedClient = await Client.findByPk(client.id);
      expect(deletedClient).toBeNull();
    });

    it('should return 404 if client to delete does not exist', async () => {
      const nonExistentId = uuidv4();
      req.params = { salonId: testSalon.id, clientId: nonExistentId };

      await deleteClient(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty('message', 'Client not found');
    });

    it('should handle deletion errors gracefully', async () => {
      const client = await Client.create({
        salonId: testSalon.id,
        name: 'Client to Delete',
        email: 'delete@test.com',
        phone: '1234567890'
      });

      req.params = { salonId: testSalon.id, clientId: client.id };

      // Mock Client.findOne to throw an error
      const mockError = new Error('Database error');
      jest.spyOn(Client, 'findOne').mockRejectedValue(mockError);

      await deleteClient(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toHaveProperty('message', 'Error deleting client');
      expect(res._getJSONData().error).toBe(mockError.message);

      // Restore the original implementation
      jest.spyOn(Client, 'findOne').mockRestore();
    });
  });
});

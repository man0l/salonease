const request = require('supertest');
const app = require('../../app'); // Assuming your Express app is exported from this file
const { Client } = require('../../config/db');

// Mock the Client model
jest.mock('../../config/db', () => ({
  Client: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Client Controller', () => {
  const mockClients = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', salonId: 'salon1' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', salonId: 'salon1' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /clients/:salonId - should return clients', async () => {
    Client.findAll.mockResolvedValue(mockClients);

    const response = await request(app).get('/clients/salon1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockClients);
    expect(Client.findAll).toHaveBeenCalledWith({ where: { salonId: 'salon1' } });
  });

  test('GET /clients/:salonId/:clientId - should return a client', async () => {
    Client.findOne.mockResolvedValue(mockClients[0]);

    const response = await request(app).get('/clients/salon1/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockClients[0]);
    expect(Client.findOne).toHaveBeenCalledWith({ where: { id: '1', salonId: 'salon1' } });
  });

  test('PUT /clients/:salonId/:clientId - should update a client', async () => {
    Client.findOne.mockResolvedValue(mockClients[0]);
    Client.update.mockResolvedValue([1]);

    const response = await request(app)
      .put('/clients/salon1/1')
      .send({ name: 'John Updated', email: 'john.updated@example.com', phone: '1234567890' });

    expect(response.status).toBe(200);
    expect(Client.update).toHaveBeenCalledWith(
      { name: 'John Updated', email: 'john.updated@example.com', phone: '1234567890' },
      { where: { id: '1', salonId: 'salon1' } }
    );
  });

  test('GET /clients/:salonId/export - should export clients as CSV', async () => {
    Client.findAll.mockResolvedValue(mockClients);

    const response = await request(app).get('/clients/salon1/export');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/csv');
    expect(response.text).toContain('John Doe,john@example.com,1234567890');
    expect(Client.findAll).toHaveBeenCalledWith({ where: { salonId: 'salon1' } });
  });

  test('POST /clients/:salonId - should add a new client', async () => {
    const clientData = {
      name: 'New Client',
      email: 'newclient@example.com',
      phone: '1234567890',
      notes: 'New client notes'
    };

    Client.create.mockResolvedValue({ id: '3', ...clientData, salonId: 'salon1' });

    const response = await request(app)
      .post('/clients/salon1')
      .send(clientData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: '3', ...clientData, salonId: 'salon1' });
    expect(Client.create).toHaveBeenCalledWith({ ...clientData, salonId: 'salon1' });
  });
});

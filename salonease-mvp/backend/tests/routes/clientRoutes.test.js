const request = require('supertest');
const app = require('../../src/app');
const { User, Salon, Client, sequelize } = require('../setupTests');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

describe('Client Routes', () => {
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

  describe('GET /api/clients/:salonId', () => {
    it('should get all clients for a salon', async () => {
      await Client.bulkCreate([
        {
          id: uuidv4(),
          salonId: salon.id,
          name: 'Client One',
          email: 'client1@example.com',
          phone: '1234567890'
        },
        {
          id: uuidv4(),
          salonId: salon.id,
          name: 'Client Two',
          email: 'client2@example.com',
          phone: '0987654321'
        }
      ]);

      const response = await request(app)
        .get(`/api/clients/${salon.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      const sortedClients = response.body.sort((a, b) => a.name.localeCompare(b.name));
      expect(sortedClients[0]).toHaveProperty('name', 'Client One');
      expect(sortedClients[1]).toHaveProperty('name', 'Client Two');
    });
  });

  describe('GET /api/clients/:salonId/:clientId', () => {
    it('should get a specific client by ID', async () => {
      const client = await Client.create({
        id: uuidv4(),
        salonId: salon.id,
        name: 'Client One',
        email: 'client1@example.com',
        phone: '1234567890'
      });

      const response = await request(app)
        .get(`/api/clients/${salon.id}/${client.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', 'Client One');
    });

    it('should return 404 if client does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .get(`/api/clients/${salon.id}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Client not found');
    });
  });

  describe('PUT /api/clients/:salonId/:clientId', () => {
    it('should update a client', async () => {
      const client = await Client.create({
        id: uuidv4(),
        salonId: salon.id,
        name: 'Client One',
        email: 'client1@example.com',
        phone: '1234567890'
      });

      const response = await request(app)
        .put(`/api/clients/${salon.id}/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Client', email: 'updated@example.com', phone: '0987654321' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Client');

      const updatedClient = await Client.findByPk(client.id);
      expect(updatedClient.name).toBe('Updated Client');
    });

    it('should return 404 if client does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .put(`/api/clients/${salon.id}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Client' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Client not found');
    });
  });

  describe('GET /api/clients/:salonId/export', () => {
    it('should export clients as CSV', async () => {
      await Client.create({
        id: uuidv4(),
        salonId: salon.id,
        name: 'Client One',
        email: 'client1@example.com',
        phone: '1234567890'
      });

      const response = await request(app)
        .get(`/api/clients/${salon.id}/export`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('Client One,client1@example.com,1234567890');
    });
  });

  describe('POST /api/clients/:salonId', () => {
    it('should add a new client', async () => {
      const clientData = {
        name: 'New Client',
        email: 'newclient@example.com',
        phone: '1234567890',
        notes: 'New client notes'
      };

      const response = await request(app)
        .post(`/api/clients/${salon.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(clientData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('name', clientData.name);
      expect(response.body).toHaveProperty('email', clientData.email);
      expect(response.body).toHaveProperty('phone', clientData.phone);
      expect(response.body).toHaveProperty('notes', clientData.notes);
      expect(response.body).toHaveProperty('salonId', salon.id);

      const addedClient = await Client.findOne({ where: { email: clientData.email } });
      expect(addedClient).not.toBeNull();
    });
  });

  describe('DELETE /api/clients/:salonId/:clientId', () => {
    it('should delete a client', async () => {
      const client = await Client.create({
        id: uuidv4(),
        salonId: salon.id,
        name: 'Client to Delete',
        email: 'delete@example.com',
        phone: '1234567890'
      });

      const response = await request(app)
        .delete(`/api/clients/${salon.id}/${client.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);

      const deletedClient = await Client.findByPk(client.id);
      expect(deletedClient).toBeNull();
    });

    it('should return 404 if client to delete does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .delete(`/api/clients/${salon.id}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Client not found');
    });
  });
});

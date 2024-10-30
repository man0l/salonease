const { sequelize, User, Salon, Staff, Service, Client, Booking, Category } = require('../setupTests');
const BOOKING_STATUSES = require('../../src/config/bookingStatuses');

describe('Booking Model', () => {
  let salon, staff, service, client, category;

  beforeEach(async () => {
    // Create owner
    const owner = await User.create({
      fullName: 'Test Owner',
      email: 'owner@example.com',
      password: 'Password123!',
      role: 'SalonOwner'
    });

    // Create salon
    salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: owner.id
    });

    // Create staff user
    const staffUser = await User.create({
      fullName: 'Test Staff',
      email: 'staff@example.com',
      password: 'Password123!',
      role: 'Staff'
    });

    // Create staff
    staff = await Staff.create({
      userId: staffUser.id,
      salonId: salon.id,
      fullName: 'Test Staff',
      email: 'staff@example.com'
    });

    // Create category first
    category = await Category.create({
      name: 'Test Category'
    });

    // Create service with category
    service = await Service.create({
      name: 'Test Service',
      duration: 60,
      price: 100,
      salonId: salon.id,
      categoryId: category.id
    });

    // Create client
    client = await Client.create({
      name: 'Test Client',
      email: 'client@example.com',
      phone: '1234567890',
      salonId: salon.id
    });
  });

  it('should create a booking with valid attributes', async () => {
    const appointmentDateTime = new Date();
    const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

    const booking = await Booking.create({
      salonId: salon.id,
      clientId: client.id,
      staffId: staff.id,
      serviceId: service.id,
      appointmentDateTime,
      endTime,
      status: BOOKING_STATUSES.PENDING
    });

    expect(booking.salonId).toBe(salon.id);
    expect(booking.clientId).toBe(client.id);
    expect(booking.staffId).toBe(staff.id);
    expect(booking.serviceId).toBe(service.id);
    expect(booking.status).toBe(BOOKING_STATUSES.PENDING);
  });

  it('should not create a booking without required fields', async () => {
    await expect(Booking.create({
      salonId: salon.id
    })).rejects.toThrow();
  });

  it('should associate booking with related models', async () => {
    const appointmentDateTime = new Date();
    const endTime = new Date(appointmentDateTime.getTime() + (service.duration * 60 * 1000));

    const booking = await Booking.create({
      salonId: salon.id,
      clientId: client.id,
      staffId: staff.id,
      serviceId: service.id,
      appointmentDateTime,
      endTime,
      status: BOOKING_STATUSES.PENDING
    });

    const bookingWithAssociations = await Booking.findByPk(booking.id, {
      include: [
        { model: Salon, as: 'salon' },
        { model: Client, as: 'client' },
        { model: Staff, as: 'staff' },
        { model: Service, as: 'service' }
      ]
    });

    expect(bookingWithAssociations.salon.id).toBe(salon.id);
    expect(bookingWithAssociations.client.id).toBe(client.id);
    expect(bookingWithAssociations.staff.id).toBe(staff.id);
    expect(bookingWithAssociations.service.id).toBe(service.id);
  });
}); 
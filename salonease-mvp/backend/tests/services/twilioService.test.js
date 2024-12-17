const twilioService = require('../../src/services/twilioService');
const twilio = require('twilio');

jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'test-sid'
      })
    }
  }));
});

describe('TwilioService', () => {
  const mockBookingDetails = {
    salonName: 'Test Salon',
    appointmentDateTime: '2024-03-20T10:00:00Z',
    serviceName: 'Haircut',
    clientName: 'John Doe'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send booking confirmation SMS', async () => {
    const phone = '+1234567890';
    await twilioService.sendBookingConfirmation(phone, mockBookingDetails);
    
    const twilioClient = twilio();
    expect(twilioClient.messages.create).toHaveBeenCalledWith({
      body: expect.stringContaining(mockBookingDetails.salonName),
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  });

  it('should send upcoming booking reminder', async () => {
    const phone = '+1234567890';
    await twilioService.sendUpcomingBookingReminder(phone, mockBookingDetails);
    
    const twilioClient = twilio();
    expect(twilioClient.messages.create).toHaveBeenCalledWith({
      body: expect.stringContaining('1 hour'),
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  });

  it('should send staff booking reminder', async () => {
    const phone = '+1234567890';
    await twilioService.sendStaffBookingReminder(phone, mockBookingDetails);
    
    const twilioClient = twilio();
    expect(twilioClient.messages.create).toHaveBeenCalledWith({
      body: expect.stringContaining('15 minutes'),
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  });

  it('should schedule booking reminders', async () => {
    const booking = {
      appointmentDateTime: new Date('2024-03-20T10:00:00Z')
    };
    const client = { phone: '+1234567890', name: 'John Doe' };
    const staff = { phone: '+0987654321' };
    const salon = { name: 'Test Salon' };
    const service = { name: 'Haircut' };

    const reminders = await twilioService.scheduleBookingReminders(
      booking,
      client,
      staff,
      salon,
      service
    );

    expect(reminders.clientReminder.date).toBeInstanceOf(Date);
    expect(reminders.staffReminder.date).toBeInstanceOf(Date);
    expect(reminders.clientReminder.phone).toBe(client.phone);
    expect(reminders.staffReminder.phone).toBe(staff.phone);
  });
}); 
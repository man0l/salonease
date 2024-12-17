const twilioService = require('../../src/services/twilioService');

// Mock the entire twilio module
jest.mock('twilio', () => {
  const mockMessagesCreate = jest.fn().mockResolvedValue({
    sid: 'test-sid',
    status: 'sent'
  });

  return jest.fn(() => ({
    messages: {
      create: mockMessagesCreate
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

  beforeAll(() => {
    // Set up environment variables for tests
    process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
    process.env.TWILIO_PHONE_NUMBER = '+15555555555';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SMS Sending', () => {
    it('should send booking confirmation SMS', async () => {
      const phone = '+1234567890';
      await twilioService.sendBookingConfirmation(phone, mockBookingDetails);
      
      const twilioClient = require('twilio')();
      expect(twilioClient.messages.create).toHaveBeenCalledWith({
        body: expect.stringContaining(mockBookingDetails.salonName),
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    });

    it('should send upcoming booking reminder', async () => {
      const phone = '+1234567890';
      await twilioService.sendUpcomingBookingReminder(phone, mockBookingDetails);
      
      const twilioClient = require('twilio')();
      expect(twilioClient.messages.create).toHaveBeenCalledWith({
        body: expect.stringContaining('1 hour'),
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    });

    it('should send staff booking reminder', async () => {
      const phone = '+1234567890';
      await twilioService.sendStaffBookingReminder(phone, mockBookingDetails);
      
      const twilioClient = require('twilio')();
      expect(twilioClient.messages.create).toHaveBeenCalledWith({
        body: expect.stringContaining('15 minutes'),
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    });

    it('should handle SMS sending errors', async () => {
      const phone = '+1234567890';
      const mockError = new Error('Failed to send SMS');
      
      const twilioClient = require('twilio')();
      twilioClient.messages.create.mockRejectedValueOnce(mockError);

      await expect(twilioService.sendSMS(phone, 'test message'))
        .rejects.toThrow('Failed to send SMS');
    });
  });

  describe('Reminder Scheduling', () => {
    it('should schedule booking reminders with correct timing', async () => {
      const appointmentDateTime = new Date('2024-03-20T10:00:00Z');
      const booking = { appointmentDateTime };
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

      // Check client reminder (1 hour before)
      const expectedClientReminderTime = new Date(appointmentDateTime);
      expectedClientReminderTime.setHours(expectedClientReminderTime.getHours() - 1);
      expect(reminders.clientReminder.date.getTime()).toBe(expectedClientReminderTime.getTime());

      // Check staff reminder (15 minutes before)
      const expectedStaffReminderTime = new Date(appointmentDateTime);
      expectedStaffReminderTime.setMinutes(expectedStaffReminderTime.getMinutes() - 15);
      expect(reminders.staffReminder.date.getTime()).toBe(expectedStaffReminderTime.getTime());

      // Check reminder details
      expect(reminders.clientReminder.phone).toBe(client.phone);
      expect(reminders.staffReminder.phone).toBe(staff.phone);
      expect(reminders.clientReminder.details.salonName).toBe(salon.name);
      expect(reminders.staffReminder.details.clientName).toBe(client.name);
    });
  });
}); 
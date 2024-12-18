const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, body) {
    try {
      const message = await this.client.messages.create({
        body,
        to,
        from: this.fromNumber
      });
      return message;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendBookingConfirmation(phone, details) {
    const message = `Your appointment at ${details.salonName} for ${details.serviceName} has been scheduled for ${new Date(details.appointmentDateTime).toLocaleString()}. We look forward to seeing you!`;
    return this.sendSMS(phone, message);
  }

  async sendUpcomingBookingReminder(phone, details) {
    const message = `Reminder: Your appointment at ${details.salonName} is in 1 hour. We look forward to seeing you!`;
    return this.sendSMS(phone, message);
  }

  async sendStaffBookingReminder(phone, details) {
    const message = `Reminder: You have an appointment with ${details.clientName} in 15 minutes for ${details.serviceName}.`;
    return this.sendSMS(phone, message);
  }

  scheduleBookingReminders(booking, client, staff, salon, service) {
    const appointmentDate = new Date(booking.appointmentDateTime);
    
    // Schedule client reminder 1 hour before
    const clientReminderDate = new Date(appointmentDate);
    clientReminderDate.setHours(clientReminderDate.getHours() - 1);

    // Schedule staff reminder 15 minutes before
    const staffReminderDate = new Date(appointmentDate);
    staffReminderDate.setMinutes(staffReminderDate.getMinutes() - 15);

    return {
      clientReminder: {
        date: clientReminderDate,
        phone: client.phone,
        details: {
          salonName: salon.name,
          serviceName: service.name,
          appointmentDateTime: booking.appointmentDateTime
        }
      },
      staffReminder: {
        date: staffReminderDate,
        phone: staff.phone,
        details: {
          clientName: client.name,
          serviceName: service.name,
          appointmentDateTime: booking.appointmentDateTime
        }
      }
    };
  }

  static getInstance() {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }
}

module.exports = TwilioService;

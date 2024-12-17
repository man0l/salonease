const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class TwilioService {
  async sendSMS(to, message) {
    try {
      const response = await client.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      return response;
    } catch (error) {      
      throw error;
    }
  }

  async sendBookingConfirmation(phoneNumber, bookingDetails) {
    const message = `Your booking at ${bookingDetails.salonName} has been confirmed for ${bookingDetails.appointmentDateTime}. Service: ${bookingDetails.serviceName}`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendUpcomingBookingReminder(phoneNumber, bookingDetails) {
    const message = `Reminder: Your appointment at ${bookingDetails.salonName} is in 1 hour (${bookingDetails.appointmentDateTime}). Service: ${bookingDetails.serviceName}`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendStaffBookingReminder(phoneNumber, bookingDetails) {
    const message = `Upcoming appointment in 15 minutes (${bookingDetails.appointmentDateTime}). Client: ${bookingDetails.clientName}, Service: ${bookingDetails.serviceName}`;
    return this.sendSMS(phoneNumber, message);
  }

  async scheduleBookingReminders(booking, client, staff, salon, service) {
    const bookingDetails = {
      salonName: salon.name,
      appointmentDateTime: booking.appointmentDateTime,
      serviceName: service.name,
      clientName: client.name
    };

    // Schedule 1-hour reminder for client
    const clientReminderDate = new Date(booking.appointmentDateTime);
    clientReminderDate.setHours(clientReminderDate.getHours() - 1);
    
    // Schedule 15-minute reminder for staff
    const staffReminderDate = new Date(booking.appointmentDateTime);
    staffReminderDate.setMinutes(staffReminderDate.getMinutes() - 15);

    return {
      clientReminder: { date: clientReminderDate, phone: client.phone, details: bookingDetails },
      staffReminder: { date: staffReminderDate, phone: staff.phone, details: bookingDetails }
    };
  }
}

module.exports = new TwilioService();

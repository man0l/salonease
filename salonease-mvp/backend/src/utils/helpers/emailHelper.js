const nodemailer = require('nodemailer');

// Create a transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

exports.sendVerificationEmail = async (email, token) => {
  return Promise.resolve();
};

exports.sendInvitationEmail = async (email, fullName, salonName, invitationToken) => {
  const subject = 'Invitation to join salon staff';
  const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
  const text = `Dear ${fullName},

You have been invited to join the staff of ${salonName} on SalonEase.

To accept this invitation, please click on the following link:
${invitationLink}

This invitation link will expire in 7 days.

If you did not expect this invitation, please ignore this email.

Best regards,
The SalonEase Team`;

  await sendEmail(email, subject, text);
};

exports.sendWelcomeEmail = async (email, fullName, salonName) => {
  const subject = 'Welcome to the team!';
  const text = `Dear ${fullName},

Welcome to the ${salonName} team! Your account has been successfully created.

You can now log in to the SalonEase platform using your email address and the password you set.

If you have any questions, please don't hesitate to contact your salon manager.

Best regards,
The SalonEase Team`;

  await sendEmail(email, subject, text);
};

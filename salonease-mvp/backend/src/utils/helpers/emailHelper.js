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

const sendEmail = async (to, subject, htmlContent, textContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

exports.sendVerificationEmail = async (email, token) => {
  const subject = 'Verify Your Email Address';
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Dear User,</h2>
        <p>Thank you for registering with SalonEase. To complete your registration, please verify your email address by clicking on the following button:</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>This verification link will expire in 1 hour.</p>
        <p>If you did not create an account with SalonEase, please ignore this email.</p>
        <p>Best regards,<br>The SalonEase Team</p>
      </body>
    </html>
  `;

  const textContent = `Dear User,

Thank you for registering with SalonEase. To complete your registration, please verify your email address by clicking on the following link:

${verificationLink}

This verification link will expire in 1 hour.

If you did not create an account with SalonEase, please ignore this email.

Best regards,
The SalonEase Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendInvitationEmail = async (email, fullName, salonName, invitationToken) => {
  const subject = 'Invitation to join salon staff';
  const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Dear ${fullName},</h2>
        <p>You have been invited to join the staff of <strong>${salonName}</strong> on SalonEase.</p>
        <p>To accept this invitation, please click on the following button:</p>
        <p>
          <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        </p>
        <p>This invitation link will expire in 7 days.</p>
        <p>If you did not expect this invitation, please ignore this email.</p>
        <p>Best regards,<br>The SalonEase Team</p>
      </body>
    </html>
  `;

  const textContent = `Dear ${fullName},

You have been invited to join the staff of ${salonName} on SalonEase.

To accept this invitation, please click on the following link:
${invitationLink}

This invitation link will expire in 7 days.

If you did not expect this invitation, please ignore this email.

Best regards,
The SalonEase Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendWelcomeEmail = async (email, fullName, salonName) => {
  const subject = 'Welcome to the team!';
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Dear ${fullName},</h2>
        <p>Welcome to the <strong>${salonName}</strong> team! Your account has been successfully created.</p>
        <p>You can now log in to the SalonEase platform using your email address and the password you set.</p>
        <p>If you have any questions, please don't hesitate to contact your salon manager.</p>
        <p>Best regards,<br>The SalonEase Team</p>
      </body>
    </html>
  `;

  const textContent = `Dear ${fullName},

Welcome to the ${salonName} team! Your account has been successfully created.

You can now log in to the SalonEase platform using your email address and the password you set.

If you have any questions, please don't hesitate to contact your salon manager.

Best regards,
The SalonEase Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

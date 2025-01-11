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
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
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
        <p>Thank you for registering with ZenManager. To complete your registration, please verify your email address by clicking on the following button:</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>This verification link will expire in 1 hour.</p>
        <p>If you did not create an account with ZenManager, please ignore this email.</p>
        <p>Best regards,<br>The ZenManager Team</p>
      </body>
    </html>
  `;

  const textContent = `Dear User,

Thank you for registering with ZenManager. To complete your registration, please verify your email address by clicking on the following link:

${verificationLink}

This verification link will expire in 1 hour.

If you did not create an account with ZenManager, please ignore this email.

Best regards,
The ZenManager Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendInvitationEmail = async (email, fullName, salonName, invitationToken) => {
  const subject = 'Invitation to join salon staff';
  const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Dear ${fullName},</h2>
        <p>You have been invited to join the staff of <strong>${salonName}</strong> on ZenManager.</p>
        <p>To accept this invitation, please click on the following button:</p>
        <p>
          <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        </p>
        <p>This invitation link will expire in 7 days.</p>
        <p>If you did not expect this invitation, please ignore this email.</p>
        <p>Best regards,<br>The ZenManager Team</p>
      </body>
    </html>
  `;

  const textContent = `Dear ${fullName},

You have been invited to join the staff of ${salonName} on ZenManager.

To accept this invitation, please click on the following link:
${invitationLink}

This invitation link will expire in 7 days.

If you did not expect this invitation, please ignore this email.

Best regards,
The ZenManager Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendWelcomeEmail = async (email, fullName, salonName) => {
  const subject = 'Welcome to the team!';
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Dear ${fullName},</h2>
        <p>Welcome to the <strong>${salonName}</strong> team! Your account has been successfully created.</p>
        <p>You can now log in to the ZenManager platform using your email address and the password you set.</p>
        <p>If you have any questions, please don't hesitate to contact your salon manager.</p>
        <p>Best regards,<br>The ZenManager Team</p>
      </body>
    </html>
  `;

  const textContent = `Dear ${fullName},

Welcome to the ${salonName} team! Your account has been successfully created.

You can now log in to the ZenManager platform using your email address and the password you set.

If you have any questions, please don't hesitate to contact your salon manager.

Best regards,
The ZenManager Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendTrialEndingEmail = async (email, daysRemaining) => {
  const subject = 'Your ZenManager Trial is Ending Soon';
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Your Trial is Ending Soon</h2>
        <p>Your ZenManager trial period will end in ${daysRemaining} days.</p>
        <p>To continue using all features of ZenManager, please update your subscription:</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/settings/subscription" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Update Subscription
          </a>
        </p>
        <p>If you have any questions about our subscription plans, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The ZenManager Team</p>
      </body>
    </html>
  `;

  const textContent = `Your Trial is Ending Soon

Your ZenManager trial period will end in ${daysRemaining} days.

To continue using all features of ZenManager, please update your subscription:
${process.env.FRONTEND_URL}/settings/subscription

If you have any questions about our subscription plans, please don't hesitate to contact our support team.

Best regards,
The ZenManager Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendSubscriptionFailedEmail = async (email, reason) => {
  const subject = 'Subscription Payment Failed';
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Subscription Payment Failed</h2>
        <p>We were unable to process your subscription payment for ZenManager.</p>
        <p>Reason: ${reason}</p>
        <p>To avoid any interruption in service, please update your payment method:</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/settings/billing" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Update Payment Method
          </a>
        </p>
        <p>If you need assistance, please contact our support team.</p>
        <p>Best regards,<br>The ZenManager Team</p>
      </body>
    </html>
  `;

  const textContent = `Subscription Payment Failed

We were unable to process your subscription payment for ZenManager.

Reason: ${reason}

To avoid any interruption in service, please update your payment method:
${process.env.FRONTEND_URL}/settings/billing

If you need assistance, please contact our support team.

Best regards,
The ZenManager Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

exports.sendSubscriptionCanceledEmail = async (email) => {
  const subject = 'Subscription Canceled';
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Subscription Canceled</h2>
        <p>Your ZenManager subscription has been canceled.</p>
        <p>You will continue to have access to your account until the end of your current billing period.</p>
        <p>If you'd like to reactivate your subscription:</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/settings/subscription" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Reactivate Subscription
          </a>
        </p>
        <p>We're sorry to see you go. If you have any feedback about how we can improve our service, please let us know.</p>
        <p>Best regards,<br>The ZenManager Team</p>
      </body>
    </html>
  `;

  const textContent = `Subscription Canceled

Your ZenManager subscription has been canceled.

You will continue to have access to your account until the end of your current billing period.

If you'd like to reactivate your subscription:
${process.env.FRONTEND_URL}/settings/subscription

We're sorry to see you go. If you have any feedback about how we can improve our service, please let us know.

Best regards,
The ZenManager Team`;

  await sendEmail(email, subject, htmlContent, textContent);
};

module.exports = {
  sendEmail,
  sendVerificationEmail: exports.sendVerificationEmail,
  sendInvitationEmail: exports.sendInvitationEmail,
  sendWelcomeEmail: exports.sendWelcomeEmail,
  sendTrialEndingEmail: exports.sendTrialEndingEmail,
  sendSubscriptionFailedEmail: exports.sendSubscriptionFailedEmail,
  sendSubscriptionCanceledEmail: exports.sendSubscriptionCanceledEmail
};

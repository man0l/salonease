exports.sendVerificationEmail = async (email, token) => {
  // Simulate sending an email
  console.log(`Sending verification email to ${email} with token: ${token}`);
  return Promise.resolve();
};

exports.sendInvitationEmail = async (email, fullName, salonName) => {
  // Simulate sending an email
  console.log(`Sending invitation email to ${email} for ${salonName} with name: ${fullName}`);
  return Promise.resolve();
};

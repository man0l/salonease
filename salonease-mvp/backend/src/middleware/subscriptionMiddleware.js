const { User, Salon } = require('../config/db');
const ROLES = require('../config/roles');

const checkSubscription = async (req, res, next) => {
  // Allow during onboarding for salon owners
  if (req.user.role === ROLES.SALON_OWNER && !req.user.onboardingCompleted) {
    return next();
  }

  let salonOwner;
  
  if (req.user.role === ROLES.SALON_OWNER) {
    salonOwner = req.user;
  } else if (req.user.role === ROLES.STAFF && req.staffMember) {
    // For staff members, get the salon owner's subscription status
    const salon = await Salon.findByPk(req.staffMember.salonId, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['subscriptionStatus', 'trialEndsAt']
      }]
    });
    
    if (!salon || !salon.owner) {
      return res.status(403).json({
        message: 'Salon owner not found',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }
    
    salonOwner = salon.owner;
  }

  // Check subscription status
  if (!salonOwner.subscriptionStatus || 
      (salonOwner.subscriptionStatus !== 'trialing' && 
       salonOwner.subscriptionStatus !== 'active')) {
    return res.status(403).json({
      message: 'Salon owner subscription required',
      code: 'SUBSCRIPTION_REQUIRED'
    });
  }

  next();
};

module.exports = checkSubscription; 
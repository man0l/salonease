const FacebookService = require('../services/facebookService');
const facebookService = FacebookService.getInstance();

exports.trackLead = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    await facebookService.trackLead({
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: email,
      fn: firstName, // Facebook hashed parameter for first name
      ln: lastName,  // Facebook hashed parameter for last name
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking Facebook lead:', error);
    res.status(500).json({ 
      message: 'Error tracking lead event',
      error: error.message 
    });
  }
};

exports.trackPageView = async (req, res) => {
  try {
    await facebookService.trackPageView({
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking Facebook PageView:', error);
    res.status(500).json({ 
      message: 'Error tracking PageView event',
      error: error.message 
    });
  }
};

exports.trackStartTrial = async (req, res) => {
  try {
    const { email, firstName, lastName, fullName } = req.body;

    await facebookService.trackStartTrial({
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: email,
      fn: firstName, // Facebook hashed parameter for first name
      ln: lastName,  // Facebook hashed parameter for last name
      external_id: email // Use email as external_id for better tracking
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking Facebook StartTrial:', error);
    res.status(500).json({ 
      message: 'Error tracking StartTrial event',
      error: error.message 
    });
  }
}; 
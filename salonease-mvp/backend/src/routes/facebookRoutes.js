const express = require('express');
const router = express.Router();
const facebookService = require('../services/facebookService');

router.post('/events/lead', async (req, res) => {
  try {
    const { eventName, ...eventData } = req.body;
    
    if (!eventName || !eventData.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters' 
      });
    }
    
    await facebookService.trackEvent(eventName, eventData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Facebook event tracking error:', error);

    // Return appropriate status code based on error type
    const status = error.message.includes('not configured') ? 503 : 500;
    
    res.status(status).json({ 
      success: false, 
      message: error.message || 'Event tracking failed'
    });
  }
});

module.exports = router; 
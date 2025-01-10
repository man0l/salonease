const axios = require('axios');
const crypto = require('crypto');

class FacebookService {
  constructor() {
    if (!FacebookService.instance) {
      this.apiToken = process.env.FACEBOOK_API_TOKEN;
      this.pixelId = '459929180326548';
      this.apiVersion = 'v18.0';
      this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events`;
      FacebookService.instance = this;
    }
    return FacebookService.instance;
  }

  hashData(data) {
    if (!data) return '';
    return crypto
      .createHash('sha256')
      .update(data.toLowerCase().trim())
      .digest('hex');
  }

  static getInstance() {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }

  async trackEvent(eventName, eventData) {
    try {
      // Validate required parameters
      if (!eventName) {
        throw new Error('Event name is required');
      }
      
      if (!eventData || !eventData.email) {
        throw new Error('Event data with email is required');
      }

      if (!this.apiToken) {
        throw new Error('Facebook API token is not configured');
      }

      const payload = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            em: this.hashData(eventData.email),
            fn: this.hashData(eventData.firstName),
            ln: this.hashData(eventData.lastName),
          }
        }],
        access_token: this.apiToken
      };

      const response = await axios.post(this.baseUrl, payload);
      
      if (response.data.error) {
        throw new Error(`Facebook API Error: ${response.data.error.message}`);
      }

      return true;
    } catch (error) {
      // Log detailed error information
      console.error('Facebook tracking error:', {
        eventName,
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      // Rethrow with a cleaner message for the client
      throw new Error('Failed to track Facebook event');
    }
  }

  async trackPageView(userData = {}) {
    return this.trackEvent('PageView', userData);
  }

  async trackLead(userData = {}) {
    return this.trackEvent('Lead', userData);
  }

  async trackStartTrial(userData = {}) {
    return this.trackEvent('StartTrial', userData);
  }
}

module.exports = new FacebookService(); 
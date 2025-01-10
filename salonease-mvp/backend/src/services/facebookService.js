const axios = require('axios');

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

  static getInstance() {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }

  async trackEvent(eventName, userData = {}, customData = {}) {
    try {
      const eventData = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            client_ip_address: userData.ip || '',
            client_user_agent: userData.userAgent || '',
            ...userData
          },
          custom_data: customData
        }],
        access_token: this.apiToken
      };

      const response = await axios.post(this.baseUrl, eventData);
      return response.data;
    } catch (error) {
      console.error(`Error tracking Facebook event ${eventName}:`, error);
      throw error;
    }
  }

  async trackPageView(userData = {}) {
    return this.trackEvent('PageView', userData);
  }

  async trackLead(userData = {}) {
    return this.trackEvent('Lead', userData);
  }

  async trackStartTrial(userData = {}) {
    return this.trackEvent('StartTrial', userData, {
      value: 0,
      currency: 'BGN'
    });
  }
}

module.exports = FacebookService; 
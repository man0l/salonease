import { api } from './api';

export const trackFacebookEvent = async (eventName, eventData) => {
  try {
    if (!eventName || !eventData?.email) {
      console.error('Invalid Facebook event data:', { eventName, eventData });
      return false;
    }

    const response = await api.post('/facebook/events/lead', {
      eventName,
      ...eventData
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Facebook tracking failed');
    }

    return true;
  } catch (error) {
    // Log error but don't disrupt the user experience
    console.error(`Failed to track Facebook ${eventName} event:`, {
      error: error.message,
      response: error.response?.data,
      data: eventData
    });
    return false;
  }
}; 
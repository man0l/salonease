import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Store of waiting requests
let refreshSubscribers = [];

// Function to add callbacks to the subscriber list
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
}

// Function to resolve all subscribers with a new token
const onRefreshed = (token) => {
  refreshSubscribers.map(callback => callback(token));
  refreshSubscribers = [];
}

// Create a separate axios instance for refresh token requests
const refreshApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate refresh token function
const refreshAccessToken = async (refreshToken) => {
  const response = await refreshApi.post('/auth/refresh-token', { refreshToken });
  return response.data;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors first
    if (!error.response) {
      // Network error or server not responding
      return Promise.reject({
        message: 'Unable to connect to server. Please check your internet connection.',
        isNetworkError: true,
        originalError: error
      });
    }

    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const { token, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        onRefreshed(token);

        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Return a more specific error for authentication failures
        return Promise.reject({
          message: 'Your session has expired. Please log in again.',
          isAuthError: true,
          originalError: refreshError
        });
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, return a structured error object
    return Promise.reject({
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status,
      originalError: error
    });
  }
);

// Then define authApi using the main api instance
const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  completeOnboarding: () => api.post('/auth/complete-onboarding'),
};

const staffApi = {
  getStaff: (salonId) => api.get(`/staff/${salonId}`),
  inviteStaff: (salonId, formData) => api.post(`/staff/${salonId}/invite`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateStaff: (salonId, staffId, formData) => api.post(`/staff/${salonId}/${staffId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteStaff: (salonId, staffId) => api.delete(`/staff/${salonId}/staff/${staffId}`),
  acceptInvitation: (data) => axios.post(`${api.defaults.baseURL}/auth/accept-invitation`, data),
  getAssociatedSalon: () => api.get('/staff/my-salon'),
  getStaffAvailability: (salonId) => api.get(`/staff-availability/${salonId}`),
  createStaffAvailability: (salonId, availabilityData) => api.post(`/staff-availability/${salonId}`, availabilityData),
  updateStaffAvailability: (salonId, availabilityId, availabilityData) => api.put(`/staff-availability/${salonId}/${availabilityId}`, availabilityData),
  deleteStaffAvailability: (salonId, availabilityId) => api.delete(`/staff-availability/${salonId}/${availabilityId}`),
};

const serviceApi = {
  getServices: (salonId) => api.get(`/services/${salonId}`),
  createService: (salonId, serviceData) => api.post(`/services/${salonId}`, serviceData),
  updateService: (serviceId, serviceData) => api.put(`/services/${serviceId}`, serviceData),
  deleteService: (serviceId) => api.delete(`/services/${serviceId}`),
};

const clientApi = {
  getClients: (salonId, searchTerm = '') => {
    return api.get(`/clients/${salonId}`, {
      params: { search: searchTerm }
    });
  },
  getClient: (salonId, clientId) => api.get(`/clients/${salonId}/${clientId}`),
  updateClient: (salonId, clientId, clientData) => api.put(`/clients/${salonId}/${clientId}`, clientData),
  exportClients: (salonId, selectedFields) => api.get(`/clients/${salonId}/export`, { 
    params: { fields: selectedFields.join(',') },
    responseType: 'blob' 
  }),
  addClient: (salonId, clientData) => api.post(`/clients/${salonId}`, clientData),
  deleteClient: (salonId, clientId) => {
    return api.delete(`/clients/${salonId}/${clientId}`);
  },
};

const bookingApi = {
  getBookings: (salonId, filters) => api.get(`/bookings/${salonId}`, { params: filters }),
  getBooking: (salonId, bookingId) => api.get(`/bookings/${salonId}/${bookingId}`),
  updateBooking: (salonId, bookingId, bookingData) => api.put(`/bookings/${salonId}/${bookingId}`, bookingData),
  deleteBooking: (salonId, bookingId, notificationMessage) => 
    api.delete(`/bookings/${salonId}/${bookingId}`, { data: { notificationMessage } }),
  checkAvailability: (salonId, staffId, date) => 
    api.get(`/bookings/${salonId}/availability`, { params: { staffId, date } }),
  createBooking: (salonId, bookingData) => api.post(`/bookings/${salonId}`, bookingData),
};

const publicApi = {
  getSalon: (salonId) => axios.get(`${api.defaults.baseURL}/public/salons/${salonId}`),
  getSalonServices: (salonId) => axios.get(`${api.defaults.baseURL}/public/salons/${salonId}/services`),
  getSalonStaff: (salonId) => axios.get(`${api.defaults.baseURL}/public/salons/${salonId}/staff`),
  getSalonServiceCategories: (salonId) => 
    axios.get(`${api.defaults.baseURL}/public/salons/${salonId}/service-categories`),
  checkSalonAvailability: (salonId, staffId, date) => 
    axios.get(`${api.defaults.baseURL}/public/salons/${salonId}/availability`, { 
      params: { date, staffId } 
    }),
  createBooking: (salonId, bookingData) => 
    axios.post(`${api.defaults.baseURL}/public/salons/${salonId}/bookings`, bookingData),
};

const dashboardApi = {
  getStats: (salonId) => api.get(`/dashboard/salons/${salonId}/stats`),
  getActivity: (salonId) => api.get(`/dashboard/salons/${salonId}/activity`),
};

const reportsApi = {
  getRevenueReport: (salonId, params) => 
    api.get(`/reports/${salonId}/revenue`, { params }),
  getStaffPerformance: (salonId, params) => 
    api.get(`/reports/${salonId}/staff-performance`, { params }),
  getServiceBreakdown: (salonId, params) => 
    api.get(`/reports/${salonId}/service-breakdown`, { params }),
  exportReport: (salonId, params) => 
    api.get(`/reports/${salonId}/export`, { 
      params,
      responseType: 'blob',
      headers: {
        'Accept': params.format === 'csv' ? 'text/csv' : 'application/pdf'
      }
    })
};

const subscriptionApi = {
  incrementBasePrice: () => api.post('/subscription/increment-base'),
  addBookingCharge: () => api.post('/subscription/add-booking-charge'),
  createSetupIntent: () => api.post('/subscription/setup-intent'),
  attachPaymentMethod: (paymentMethodId) => api.post('/subscription/attach-payment-method', { paymentMethodId }),
  startTrialSubscription: () => api.post('/subscription/start-trial'),
};

const billingApi = {
  getInvoices: async (salonId) => {
    return api.get(`/billing/${salonId}/invoices`);
  },
  getSubscriptionDetails: async (salonId) => {
    return api.get(`/billing/${salonId}/subscription`);
  },
  cancelSubscription: async (salonId) => {
    return api.post(`/billing/${salonId}/cancel-subscription`);
  }
};

const salonApi = {
  getSalons: (params = '') => api.get(`/salons${params}`),
  createSalon: (formData) => api.post('/salons', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateSalon: (salonId, formData) => api.post(`/salons/${salonId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteSalon: (salonId) => api.delete(`/salons/${salonId}`),
  restoreSalon: (salonId) => api.post(`/salons/${salonId}/restore`),
};

export { 
  api, 
  authApi, 
  staffApi, 
  serviceApi, 
  clientApi, 
  bookingApi, 
  publicApi,
  dashboardApi,
  reportsApi,
  subscriptionApi,
  billingApi,
  salonApi
};

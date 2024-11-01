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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, wait for it to complete
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
        const response = await authApi.refreshToken(refreshToken);
        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Resolve all waiting requests
        onRefreshed(token);

        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
};

const staffApi = {
  getStaff: (salonId) => api.get(`/staff/${salonId}`),
  inviteStaff: (salonId, staffData) => api.post(`/staff/${salonId}/invite`, staffData),
  updateStaff: (salonId, staffId, staffData) => api.put(`/staff/${salonId}/${staffId}`, staffData),
  deleteStaff: (salonId, staffId) => api.delete(`/staff/${salonId}/staff/${staffId}`),
  acceptInvitation: (data) => axios.post(`${api.defaults.baseURL}/auth/accept-invitation`, data),
  getAssociatedSalon: () => api.get('/staff/my-salon'),
  getStaffAvailability: (salonId) => api.get(`/salons/${salonId}/staff-availability`),
  createStaffAvailability: (salonId, availabilityData) => api.post(`/salons/${salonId}/staff-availability`, availabilityData),
  updateStaffAvailability: (salonId, availabilityId, availabilityData) => api.put(`/salons/${salonId}/staff-availability/${availabilityId}`, availabilityData),
  deleteStaffAvailability: (salonId, availabilityId) => api.delete(`/salons/${salonId}/staff-availability/${availabilityId}`),
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
    console.log('Deleting client:', { salonId, clientId });
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

export { api, authApi, staffApi, serviceApi, clientApi, bookingApi };

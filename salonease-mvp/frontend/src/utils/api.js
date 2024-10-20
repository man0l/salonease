import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors (API unreachable)
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error: Unable to reach the API');
      // You can dispatch an action to update the global state here if needed
      // For example: store.dispatch(setApiOffline(true));
      return Promise.reject(new Error('Unable to reach the server. Please check your internet connection and try again.'));
    }

    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const response = await api.post('/auth/refresh-token', { refreshToken });
        const { token } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        processQueue(null, token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
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
};

const staffApi = {
  getStaff: (salonId) => api.get(`/staff/${salonId}`),
  inviteStaff: (salonId, staffData) => api.post(`/staff/${salonId}/invite`, staffData),
  updateStaff: (salonId, staffId, staffData) => api.put(`/staff/${salonId}/${staffId}`, staffData),
  deleteStaff: (salonId, staffId) => api.delete(`/staff/${salonId}/${staffId}`),
  acceptInvitation: (data) => axios.post(`${api.defaults.baseURL}/auth/accept-invitation`, data),
  getAssociatedSalon: () => api.get('/staff/associated-salon'),
};

export { api, authApi, staffApi };

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for pending requests to prevent duplicates
const pendingRequests = new Map();

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Generate unique key for request
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
    
    if (pendingRequests.has(requestKey)) {
      // If same request is already pending, cancel this one
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
    } else {
      pendingRequests.set(requestKey, true);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Remove from pending cache
    const config = response.config;
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
    pendingRequests.delete(requestKey);

    return response;
  },
  (error) => {
    // Remove from pending cache on error too
    if (error.config) {
      const config = error.config;
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
      pendingRequests.delete(requestKey);
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Global Error Notification (using native alert for now, can be replaced by toast)
    if (error.response?.data?.message) {
       console.error('API ERROR:', error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default api;

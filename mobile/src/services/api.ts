import axios from 'axios';
import axiosRetry from 'axios-retry';
import CONFIG from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure Axios Retry: retry up to 3 times on network errors or 5xx
axiosRetry(api, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 503;
  }
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import { toast } from '../utils/toast';
import i18n from '../i18n';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle Errors (e.g., 401 Token Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (response?.status === 401 && !originalRequest._retry) {
      const isAuthRoute = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
      
      if (!isAuthRoute) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        try {
          // Use basic axios to avoid interceptor loop if refresh fails
          const res = await axios.post(`${CONFIG.API_URL}/auth/refresh`, { refreshToken });
          
          if (res.status === 200) {
            const { accessToken: newToken, refreshToken: newRefreshToken } = res.data.data.tokens;
            
            useAuthStore.getState().setTokens(newToken, newRefreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().logout();
          toast.error(
            i18n.t('common.error'), 
            i18n.t('auth.session_expired') || 'Session Expired. Please login again.'
          );
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    } else if (response?.status && response.status >= 500) {
      toast.error(
        i18n.t('common.error'), 
        i18n.t('common.server_error') || 'Server Error. Please try again later.'
      );
    } else if (error.message === 'Network Error') {
      toast.error(
        i18n.t('common.error'), 
        i18n.t('common.network_error') || 'Network Error. Check your connection.'
      );
    }

    return Promise.reject(error);
  }
);

export default api;

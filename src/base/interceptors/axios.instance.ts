import { API_URL } from '@constants/env';
import axios, { AxiosError } from 'axios';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // withCredentials: false to avoid CORS issues when backend uses AllowAnyOrigin()
  // Set to true only if backend has specific origin configured and uses cookies
  withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('auth_token');
  const rawUser = localStorage.getItem('auth_user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (user?.role) {
    config.headers['X-User-Role'] = user.role;
  }

  return config;
});

axiosInstance.interceptors.response.use((response) => response, (error: AxiosError) => {
  return Promise.reject(error);
});

export default axiosInstance;

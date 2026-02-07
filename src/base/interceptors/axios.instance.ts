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
  const accessToken = '';
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config: any }) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: false,
          },
        );
        if (response.status === 200) {
          const { accessToken } = response.data;
          pendingRequests.forEach((cb) => cb(accessToken));
          pendingRequests = [];
          original.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(original);
        }
      } catch (error) {
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

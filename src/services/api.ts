import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.example.com'; // TODO: Replace with actual API URL

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to request headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      await AsyncStorage.removeItem('authToken');
      // TODO: Navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;

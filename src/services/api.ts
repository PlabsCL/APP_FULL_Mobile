import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─── Claves de almacenamiento seguro ─────────────────────────────────────────
export const SECURE_KEYS = {
  ACCESS_TOKEN:  'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  DRIVER_ID:     'driverId',
  DRIVER_NAME:   'driverName',
} as const;

// ─── URL desde variable de entorno (no hardcodeada) ──────────────────────────
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    '[api.ts] EXPO_PUBLIC_API_BASE_URL no está definida. ' +
    'Crea un archivo .env con la URL del servidor.'
  );
}

// ─── Helpers de SecureStore ───────────────────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN,  accessToken);
  await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(SECURE_KEYS.DRIVER_ID),
    SecureStore.deleteItemAsync(SECURE_KEYS.DRIVER_NAME),
  ]);
}

// ─── Instancia Axios ──────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ─── Interceptor de request: adjunta token ───────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de respuesta: manejo de errores ─────────────────────────────
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => {
    // Validar que la respuesta tenga estructura mínima esperada
    if (response.data === undefined || response.data === null) {
      return Promise.reject(new Error('Respuesta inválida del servidor'));
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado — limpiar sesión y navegar a login
      await clearSession();
      if (onUnauthorized) onUnauthorized();
    }
    // No loguear datos sensibles — solo el status code
    return Promise.reject(error);
  }
);

export default api;

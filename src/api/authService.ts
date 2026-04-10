import { apiClient } from './client';
import { API_ENDPOINTS, STORAGE_KEYS } from './config';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.AUTH_LOGIN,
        credentials
      );
      
      // Save token
      if (response.data.token) {
        await apiClient.setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.AUTH_REGISTER,
        userData
      );
      
      // After registration, log in automatically
      if (response.status === 201) {
        const loginResponse = await this.login({
          email: userData.email,
          password: userData.password,
        });
        return loginResponse;
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiClient.clearAuth();
  },

  async getAuthToken(): Promise<string | null> {
    return await apiClient.getAuthToken();
  },

  async getCurrentUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getAuthToken();
    return !!token;
  },
};

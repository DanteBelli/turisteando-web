// Environment variables utility
// This file helps manage environment-specific configuration

export const ENV = {
  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
  
  // App Configuration
  APP_NAME: 'Turisteando',
  APP_VERSION: '1.0.0',
  
  // Feature flags
  ENABLE_DEV_MENU: process.env.EXPO_PUBLIC_ENV !== 'production',
};

export const isDevelopment = () => process.env.EXPO_PUBLIC_ENV !== 'production';
export const isProduction = () => process.env.EXPO_PUBLIC_ENV === 'production';

// API Configuration
// Change this to match your backend server URL
// For local development: http://localhost:8080
// For production: your actual API URL

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: '/login',
  AUTH_REGISTER: '/users',

  // User endpoints
  USERS: '/users',
  USER_PROFILE: (id: string) => `/users/${id}`,

  // Country endpoints
  COUNTRIES: '/countries',
  COUNTRY: (id: string) => `/countries/${id}`,

  // City endpoints
  CITIES: '/cities',
  CITY: (id: string) => `/cities/${id}`,
  CITIES_BY_COUNTRY: (countryId: string) => `/countries/${countryId}/cities`,

  // Category endpoints
  CATEGORIES: '/categories',
  CATEGORY: (id: string) => `/categories/${id}`,

  // Place endpoints
  PLACES: '/places',
  PLACE: (id: string) => `/places/${id}`,
  PLACES_BY_CITY: (cityId: string) => `/cities/${cityId}/places`,
  PLACES_BY_CATEGORY: (categoryId: string) => `/categories/${categoryId}/places`,

  // Event endpoints
  EVENTS: '/events',
  EVENT: (id: string) => `/events/${id}`,
  EVENTS_BY_PLACE: (placeId: string) => `/places/${placeId}/events`,
  EVENTS_BY_USER: (userId: string) => `/users/${userId}/events`,
};

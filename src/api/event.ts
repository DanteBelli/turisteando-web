import axios from 'axios';
import { API_BASE_URL } from './config';

export interface CreateEventPayload {
  title: string;
  description: string;
  place_id: number;
  event_date: string; // ISO format: "2026-05-15T19:00:00Z"
  image_url?: string;
  total_score?: number;
  average_score?: number;
}

export interface CreatePlacePayload {
  name: string;
  city_id: number;
  country_id: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
}

export interface Place {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  city_id: number;
  country_id: number;
  description?: string;
  address?: string;
}

export const createEvent = async (
  data: CreateEventPayload,
  token: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const createPlace = async (
  data: CreatePlacePayload,
  token: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/places`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating place:', error);
    throw error;
  }
};

export const getPlaces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/places`);
    console.log('📍 Places API response:', response.data);
    
    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si la respuesta tiene estructura { data: [...] }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Si la respuesta tiene estructura { places: [...] }
    if (response.data && Array.isArray(response.data.places)) {
      return response.data.places;
    }
    
    console.warn('Estructura de respuesta inesperada:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
};

// FAVORITES
export const addEventToFavorites = async (eventId: number, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/favorites/${eventId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response;
  } catch (error) {
    console.error('Error adding event to favorites:', error);
    throw error;
  }
};

export const removeEventFromFavorites = async (eventId: number, token: string) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/favorites/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response;
  } catch (error) {
    console.error('Error removing event from favorites:', error);
    throw error;
  }
};

export const isEventFavorite = async (eventId: number, token: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/favorites/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.is_favorite;
  } catch (error) {
    console.error('Error checking if event is favorite:', error);
    return false;
  }
};

export const getUserFavorites = async (token: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/me/favorites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (Array.isArray(response.data.favorites)) {
      return response.data.favorites;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};
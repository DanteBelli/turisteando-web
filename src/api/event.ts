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
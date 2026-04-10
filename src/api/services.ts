import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { Country, City, Place, Category, Event, ApiListResponse } from '../types';

// Country Service
export const countryService = {
  async getAll(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Country>>(
      `${API_ENDPOINTS.COUNTRIES}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Country>(API_ENDPOINTS.COUNTRY(id));
    return response.data;
  },

  async getCities(countryId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<City>>(
      `${API_ENDPOINTS.CITIES_BY_COUNTRY(countryId)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// City Service
export const cityService = {
  async getAll(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<City>>(
      `${API_ENDPOINTS.CITIES}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<City>(API_ENDPOINTS.CITY(id));
    return response.data;
  },

  async getPlaces(cityId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Place>>(
      `${API_ENDPOINTS.PLACES_BY_CITY(cityId)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// Category Service
export const categoryService = {
  async getAll(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Category>>(
      `${API_ENDPOINTS.CATEGORIES}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Category>(API_ENDPOINTS.CATEGORY(id));
    return response.data;
  },

  async getPlaces(categoryId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Place>>(
      `${API_ENDPOINTS.PLACES_BY_CATEGORY(categoryId)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// Place Service
export const placeService = {
  async getAll(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Place>>(
      `${API_ENDPOINTS.PLACES}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Place>(API_ENDPOINTS.PLACE(id));
    return response.data;
  },

  async getEvents(placeId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Event>>(
      `${API_ENDPOINTS.EVENTS_BY_PLACE(placeId)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// Event Service
export const eventService = {
  async getAll(page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Event>>(
      `${API_ENDPOINTS.EVENTS}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getAllWithPlaces() {
    try {
      const response = await apiClient.get<any>(`${API_ENDPOINTS.EVENTS}`);
      const events = response.data?.events || [];
      
      // Fetch place details for each event
      const eventsWithPlaces = await Promise.all(
        events.map(async (event: Event) => {
          try {
            const placeResponse = await apiClient.get<Place>(
              `${API_ENDPOINTS.PLACE(event.place_id)}`
            );
            return {
              ...event,
              place: placeResponse.data
            };
          } catch (error) {
            console.error(`Failed to fetch place ${event.place_id}:`, error);
            return event;
          }
        })
      );
      
      return eventsWithPlaces;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  },

  async getById(id: string) {
    const response = await apiClient.get<Event>(API_ENDPOINTS.EVENT(id));
    return response.data;
  },

  async getUserEvents(userId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get<ApiListResponse<Event>>(
      `${API_ENDPOINTS.EVENTS_BY_USER(userId)}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async create(eventData: Partial<Event>) {
    const response = await apiClient.post<Event>(
      API_ENDPOINTS.EVENTS,
      eventData
    );
    return response.data;
  },

  async update(id: string, eventData: Partial<Event>) {
    const response = await apiClient.put<Event>(
      API_ENDPOINTS.EVENT(id),
      eventData
    );
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(API_ENDPOINTS.EVENT(id));
  },

  async getEventsByCategories(categoryIds: number[]) {
    try {
      const categoriesParam = categoryIds.join(',');
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.EVENTS}/filter?categories=${categoriesParam}`
      );
      const events = response.data?.events || [];
      
      // Fetch place details for each event
      const eventsWithPlaces = await Promise.all(
        events.map(async (event: Event) => {
          try {
            const placeResponse = await apiClient.get<Place>(
              `${API_ENDPOINTS.PLACE(event.place_id)}`
            );
            return {
              ...event,
              place: placeResponse.data
            };
          } catch (error) {
            console.error(`Failed to fetch place ${event.place_id}:`, error);
            return event;
          }
        })
      );
      
      return eventsWithPlaces;
    } catch (error) {
      console.error('Failed to fetch filtered events:', error);
      throw error;
    }
  },
};

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Country, City, Category, Place, Event, ApiListResponse } from '../types';
import { countryService, cityService, categoryService, placeService, eventService } from '../api/services';

interface DataContextType {
  // Data states
  countries: Country[];
  cities: City[];
  categories: Category[];
  places: Place[];
  events: Event[];
  selectedCountry: Country | null;
  selectedCity: City | null;

  // Loading states
  isLoadingCountries: boolean;
  isLoadingCities: boolean;
  isLoadingPlaces: boolean;
  isLoadingEvents: boolean;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Error
  error: string | null;

  // Actions
  fetchCountries: (page?: number, limit?: number) => Promise<void>;
  fetchCities: (page?: number, limit?: number) => Promise<void>;
  fetchCitiesByCountry: (countryId: string, page?: number, limit?: number) => Promise<void>;
  fetchPlaces: (page?: number, limit?: number) => Promise<void>;
  fetchPlacesByCity: (cityId: string, page?: number, limit?: number) => Promise<void>;
  fetchPlacesByCategory: (categoryId: string, page?: number, limit?: number) => Promise<void>;
  fetchCategories: (page?: number, limit?: number) => Promise<void>;
  fetchEvents: (page?: number, limit?: number) => Promise<void>;
  selectCountry: (country: Country) => void;
  selectCity: (city: City) => void;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPage = 1;
  const itemsPerPage = 10;

  const fetchCountries = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoadingCountries(true);
      setError(null);
      const response = await countryService.getAll(page, limit);
      setCountries(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch countries';
      setError(errorMessage);
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  const fetchCities = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoadingCities(true);
      setError(null);
      const response = await cityService.getAll(page, limit);
      setCities(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch cities';
      setError(errorMessage);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  const fetchCitiesByCountry = useCallback(
    async (countryId: string, page = 1, limit = 10) => {
      try {
        setIsLoadingCities(true);
        setError(null);
        const response = await countryService.getCities(countryId, page, limit);
        setCities(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch cities';
        setError(errorMessage);
      } finally {
        setIsLoadingCities(false);
      }
    },
    []
  );

  const fetchPlaces = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoadingPlaces(true);
      setError(null);
      const response = await placeService.getAll(page, limit);
      setPlaces(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch places';
      setError(errorMessage);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  const fetchPlacesByCity = useCallback(async (cityId: string, page = 1, limit = 10) => {
    try {
      setIsLoadingPlaces(true);
      setError(null);
      const response = await cityService.getPlaces(cityId, page, limit);
      setPlaces(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch places';
      setError(errorMessage);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  const fetchPlacesByCategory = useCallback(
    async (categoryId: string, page = 1, limit = 10) => {
      try {
        setIsLoadingPlaces(true);
        setError(null);
        const response = await categoryService.getPlaces(categoryId, page, limit);
        setPlaces(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch places';
        setError(errorMessage);
      } finally {
        setIsLoadingPlaces(false);
      }
    },
    []
  );

  const fetchCategories = useCallback(async (page = 1, limit = 10) => {
    try {
      setError(null);
      const response = await categoryService.getAll(page, limit);
      setCategories(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
    }
  }, []);

  const fetchEvents = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoadingEvents(true);
      setError(null);
      const response = await eventService.getAll(page, limit);
      setEvents(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch events';
      setError(errorMessage);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: DataContextType = {
    countries,
    cities,
    categories,
    places,
    events,
    selectedCountry,
    selectedCity,
    isLoadingCountries,
    isLoadingCities,
    isLoadingPlaces,
    isLoadingEvents,
    currentPage,
    itemsPerPage,
    error,
    fetchCountries,
    fetchCities,
    fetchCitiesByCountry,
    fetchPlaces,
    fetchPlacesByCity,
    fetchPlacesByCategory,
    fetchCategories,
    fetchEvents,
    selectCountry: setSelectedCountry,
    selectCity: setSelectedCity,
    clearError,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

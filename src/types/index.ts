// User related types
export interface User {
  id: number;
  email: string;
  name: string;
  last_name: string;
  celular: number;
  tipo_user: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  last_name: string;
  celular: number;
  password: string;
}

// Location related types
export interface Country {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  city_id: string;
  category_id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  place_id: string;
  created_by: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string;
  total_score?: number;
  average_score?: number;
  created_at: string;
  updated_at?: string;
  place?: Place;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

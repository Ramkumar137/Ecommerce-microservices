export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
}
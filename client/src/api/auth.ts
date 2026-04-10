import api from './client';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'owner' | 'admin';
  };
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  preferred_language?: 'bg' | 'en';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  signup: (data: SignupData) =>
    api.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
};

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

export interface ProfileReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  venue: { id: string; name: string } | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  avatar_url: string | null;
  preferred_language: 'bg' | 'en';
  created_at: string;
  reviews: ProfileReview[];
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  preferred_language?: 'bg' | 'en';
}

export const authApi = {
  signup: (data: SignupData) =>
    api.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getProfile: () =>
    api.get<Profile>('/auth/profile').then((r) => r.data),

  updateProfile: (data: UpdateProfileData) =>
    api.patch<AuthResponse>('/auth/profile', data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<AuthResponse>('/auth/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

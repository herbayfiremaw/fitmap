import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type AuthResponse, type SignupData, type LoginData } from '../api/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: (response: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuth = (response: AuthResponse) => {
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    handleAuth(response);
  };

  const signup = async (data: SignupData) => {
    const response = await authApi.signup(data);
    handleAuth(response);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = (response: AuthResponse) => {
    handleAuth(response);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { create } from 'zustand';
import { Role } from '../constants';

interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize state from localStorage if available
  const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  let initialUser = null;
  try {
    if (savedUser) initialUser = JSON.parse(savedUser);
  } catch (e) {
    console.error('Failed to parse saved user:', e);
  }

  return {
    user: initialUser,
    token: savedToken,
    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  };
});

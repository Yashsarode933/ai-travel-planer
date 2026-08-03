import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        
        setUser: (user) => set({ user }),
        
        setToken: (token) => set({ token }),
        
        login: (user, token) => {
          set({ user, token, isAuthenticated: true });
          localStorage.setItem('token', token);
        },
        
        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
        },
        
        checkAuth: async () => {
          const { token } = get();
          
          if (!token) {
            return false;
          }
          
          try {
            // Verify token by calling the auth endpoint
            const response = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const { user } = await response.json();
              set({ user, token, isAuthenticated: true });
              return true;
            }
          } catch (error) {
            console.error('Auth check error:', error);
          }
          
          get().logout();
          return false;
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ token: state.token }),
      }
    )
  )
);
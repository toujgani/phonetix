import { create } from 'zustand';
import { User } from '../types';
import { apiRequest } from '../services/http';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

interface AuthResponse { token: string; user: User }

export const useAuthStore = create<AuthState>((set) => {
  // Check persisted session
  let savedUser: User | null = null;
  let savedToken: string | null = null;
  const rawSession = localStorage.getItem('phonetix_auth_session');

  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession);
      savedUser = parsed.user;
      savedToken = parsed.token;
    } catch {
      localStorage.removeItem('phonetix_auth_session');
    }
  }

  // Force default light mode as requested in requirement #1 and #8
  const savedTheme = localStorage.getItem('phonetix_theme');
  const initialTheme = savedTheme === 'dark' || savedTheme === 'system' ? savedTheme : 'light';
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  };
  applyTheme(initialTheme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('phonetix_theme') === 'system') applyTheme('system');
  });

  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedUser && !!savedToken,
    theme: initialTheme,

    login: async (email: string, password: string, rememberMe = true) => {
      let response: AuthResponse;
      try {
        response = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('ACCOUNT_PENDING') || message.includes('ACCOUNT_SUSPENDED') || message.includes('ACCOUNT_REJECTED')) throw new Error(message.match(/ACCOUNT_(?:PENDING|SUSPENDED|REJECTED)/)?.[0]);
        throw error;
      }
      const { user: userProfile, token } = response;

      if (rememberMe) {
        localStorage.setItem(
          'phonetix_auth_session',
          JSON.stringify({ user: userProfile, token })
        );
      }

      set({
        user: userProfile,
        token,
        isAuthenticated: true,
      });

      return userProfile;
    },

    logout: () => {
      const token = useAuthStore.getState().token;
      if (token) void apiRequest('/auth/logout', { method: 'POST' }, token).catch(() => undefined);
      localStorage.removeItem('phonetix_auth_session');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    },

    setTheme: (theme) => {
      localStorage.setItem('phonetix_theme', theme);
      const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      set({ theme });
    },
  };
});

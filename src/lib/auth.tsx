import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  clearStoredAuthToken,
  getStoredAuthToken,
  storeAuthToken,
  subscribeToUnauthorized,
  type AuthUser,
} from './api';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToUnauthorized(() => {
      if (active) {
        setUser(null);
        setIsLoading(false);
      }
    });

    const token = getStoredAuthToken();

    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
        unsubscribe();
      };
    }

    api.getCurrentUser()
      .then((nextUser) => {
        if (active) {
          setUser(nextUser);
        }
      })
      .catch(() => {
        if (active) {
          clearStoredAuthToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    async login(email: string, password: string) {
      const session = await api.login({ email, password });
      storeAuthToken(session.token);
      setUser(session.user);
      return session.user;
    },
    async logout() {
      try {
        await api.logout();
      } catch {
        // The token is client-managed, so local cleanup is enough if logout fails.
      } finally {
        clearStoredAuthToken();
        setUser(null);
      }
    },
  }), [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

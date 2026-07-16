 import { createContext, useContext, useEffect, useState } from 'react';
  import type { ReactNode } from 'react';
  import { AuthService } from '../services/AuthService';
  import type { LoginType, RegisterType } from '../services/AuthService';

  interface AuthContextValue {
      user: RegisterType | null;
      loading: boolean;
      login: (payload: LoginType) => Promise<void>;
      logout: () => Promise<void>;
  }

  const AuthContext = createContext<AuthContextValue | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
      const [user, setUser] = useState<RegisterType | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
          AuthService.getCurrentUser()
              .then(setUser)
              .finally(() => setLoading(false));
      }, []);

      const login = async (payload: LoginType) => {
          const loggedUser = await AuthService.Login(payload);
          setUser(loggedUser);
      };

      const logout = async () => {
          await AuthService.logout();
          setUser(null);
      };

      return (
          <AuthContext.Provider value={{ user, loading, login, logout }}>
              {children}
          </AuthContext.Provider>
      );
  }

  export function useAuth() {
      const context = useContext(AuthContext);
      if (!context) {
          throw new Error("");
      }
      return context;
  }

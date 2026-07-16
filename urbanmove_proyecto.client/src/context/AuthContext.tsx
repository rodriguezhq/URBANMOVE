import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginType, RegisterType } from '../Types/authType';

interface AuthContextValue {
    user: RegisterType | null;
    loading: boolean;
    Login: (loginData: LoginType) => Promise<void>;
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

    const Login = async (loginData: LoginType) => {
        const loggedUser = await AuthService.Login(loginData);
        setUser(loggedUser);
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, Login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("No la ");
    }
    return context;
}
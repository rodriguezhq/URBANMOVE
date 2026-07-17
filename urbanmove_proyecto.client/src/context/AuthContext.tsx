import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginType, UserType } from '../Types/authType';
import type {RegisterType} from "../Types/RegisterType";

interface AuthContextValue {
    user: UserType | null;
    loading: boolean;
    Login: (loginData: LoginType) => Promise<boolean>;
    register: (registerData: RegisterType) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    
    const Login = async (loginData: LoginType) : Promise<boolean> => {
        setLoading(true);
        let result = false;
        try {
            const loggedUser = await AuthService.Login(loginData);
            setUser(loggedUser);
            result = true;
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setLoading(false);
        }
        
        return result;
    };
    
    const logout = async () => {
        setLoading(true);
        await AuthService.logout();
        setUser(null);
        setLoading(false);
    };

    const register = async (registerData: RegisterType): Promise<boolean> => {
        setLoading(true);
        let result = false;
        try {
            const newUser = await AuthService.register(registerData);
            setUser(newUser);
            result = true;
        } catch (error) {
            console.error("Fallo de Registro", error);
        } finally {
            setLoading(false);
        }
        return result;
    };

    const values = useMemo(() => ({
        user,
        loading,
        Login,
        logout,
        register
    }), [user, loading]);

    
    useEffect(() => {
        AuthService.getCurrentUser()
            .then(setUser)
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
}


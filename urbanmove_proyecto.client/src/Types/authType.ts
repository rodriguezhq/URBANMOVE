export interface LoginType {
    email: string;
    password: string;
}

export interface UserType {
    id: string;
    fullName: string;
    email: string;
    role: RolType;
    verifiedEmail: boolean;
}

export type RolType = 'ciudadano' | 'operador' | 'admin';
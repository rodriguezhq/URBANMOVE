export interface LoginType {
    email: string;
    password: string;
}

export interface UserType {
    id: string;
    fullName: string;
    email: string;
    role: RolType;
}

export type RolType = 'ciudadano' | 'operador' | 'admin';
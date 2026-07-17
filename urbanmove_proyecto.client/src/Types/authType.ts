export interface LoginType {
    email: string;
    password: string;
}

export interface UserType {
    id: string;
    fullName: string;
    email: string;
    rol: RolType;
}

export type RolType = 'ciudadano' | 'operador' | 'admin';
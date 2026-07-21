export interface LoginType {
    email: string;
    password: string;
}

export interface UserType {
    id: string;
    nombres: string;
    apellidos: string;
    fullName: string;
    email: string;
    role: RolType;
    verifiedEmail: boolean;
}

export type RolType = 'ciudadano' | 'operador' | 'admin';

export interface OperadorPendienteType {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    fechaRegistro: string;
}

export interface RegisterResultType {
    message: string;
    id?: string;
    fullName?: string;
    email?: string;
    role?: RolType;
    verifiedEmail?: boolean;
}
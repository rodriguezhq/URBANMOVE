export type CategoriaIncidente = 'Accidente' | 'Congestion' | 'Vandalismo';

export type EstadoIncidente = 'Pendiente' | 'EnRevision' | 'Resuelto';

export interface IncidenteResponseDto {
    id: number;
    descripcion: string;
    imagenUrl: string | null;
    categoria: CategoriaIncidente;
    estado: EstadoIncidente;
    fechaRegistro: string;
    lat: number;
    lng: number;
    usuarioId: string;
    usuarioNombre: string;
}

export interface CrearIncidenteData {
    descripcion: string;
    categoria: CategoriaIncidente;
    lat: number;
    lng: number;
    imagen: File | null;
}
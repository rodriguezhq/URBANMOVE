// ─── Tipos que mapean 1:1 con los DTOs del backend (RF-02) ───────────────────

export interface ParadaDto {
    id: number;
    nombre: string;
    lat: number;
    lng: number;
}

export interface LineaDto {
    id: number;
    nombre: string;
}

export interface SalidaDto {
    id: number;
    fechaHoraSalida: string;      // ISO string UTC
    fechaHoraLlegadaEstimada: string;
    estado: 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada';
    placaUnidad: string;
    capacidadTotal: number;
    asientosOcupados: number;
    asientosDisponibles: number;
}

export interface RutaParadaDto {
    orden: number;
    parada: ParadaDto;
}

export interface RutaResumenDto {
    id: number;
    nombre: string;
    linea: LineaDto;
    paradas: RutaParadaDto[];
    salidas: SalidaDto[];
    recorridoGeoJson?: string;
}

export interface ResultadoPaginadoDto<T> {
    paginaActual: number;
    tamanioPagina: number;
    totalRegistros: number;
    totalPaginas: number;
    datos: T[];
}
export interface ReservarAsientoResponse {
    mensaje: string;
    codigo: string;
}

// ─── Filtros de búsqueda (refleja BusquedaRutasRequest del backend) ───────────

export interface FiltrosBusqueda {
    origenParadaId?: number;
    destinoParadaId?: number;
    lineaId?: number;
    fechaHoraDesde?: string;
    fechaHoraHasta?: string;
    soloConAsientos: boolean;
    pagina: number;
    tamanioPagina: number;
}

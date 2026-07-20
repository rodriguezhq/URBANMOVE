// ─── Tipos que mapean 1:1 con los DTOs del backend (RF-04) ───────────────────

import type { CategoriaIncidente, EstadoIncidente } from './incidentesTypes';

export interface DashboardKpis {
    unidadesActivas: number;
    unidadesTotal: number;
    salidasEnCurso: number;
    salidasProximas: number;
    incidentesPendientes: number;
    ocupacionPromedio: number; // 0-100
}

export interface UnidadEstado {
    id: number;
    placa: string;
    capacidad: number;
    activa: boolean;
    velocidadPromedioKmH: number;
    salidaActual: string | null;
}

export interface Frecuencia {
    salidaId: number;
    ruta: string;
    linea: string;
    placaUnidad: string;
    fechaHoraSalida: string; // ISO string UTC
    fechaHoraLlegadaEstimada: string;
    estado: 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada';
    asientosOcupados: number;
    capacidadTotal: number;
}

export interface Alerta {
    tipo: 'Retraso' | 'Incidente';
    mensaje: string;
    fecha: string;
}

export interface PuntoMapa {
    nombre: string;
    lat: number;
    lng: number;
}

export interface IncidenteMapa {
    id: number;
    descripcion: string;
    categoria: CategoriaIncidente;
    estado: EstadoIncidente;
    lat: number;
    lng: number;
    fechaRegistro: string;
}

export interface DashboardMapa {
    paradas: PuntoMapa[];
    incidentes: IncidenteMapa[];
}

export interface DashboardResumen {
    kpis: DashboardKpis;
    unidades: UnidadEstado[];
    frecuencias: Frecuencia[];
    alertas: Alerta[];
    mapa: DashboardMapa;
}

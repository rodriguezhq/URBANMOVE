// ─── Tipos que mapean 1:1 con los DTOs del backend (RF-05) ───────────────────

export type TipoMovimiento = 'Ganados' | 'Canjeados';

export interface Comercio {
    id: number;
    nombre: string;
    direccion: string;
    lat: number;
    lng: number;
}

export interface CrearComercioInput {
    nombre: string;
    direccion: string;
    lat: number;
    lng: number;
}

export interface MovimientoPuntos {
    id: number;
    cantidad: number;
    tipo: TipoMovimiento;
    descripcion: string | null;
    fecha: string; // ISO string UTC
}

export interface SaldoPuntos {
    saldoActual: number;
    movimientos: MovimientoPuntos[];
}

export interface CanjeResultado {
    saldoRestante: number;
    puntosCanjeados: number;
    descuentoSoles: number;
    comercio: string;
}
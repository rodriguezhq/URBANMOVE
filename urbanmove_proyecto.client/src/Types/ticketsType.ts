export type EstadoTicket = 'Reservado' | 'Validado' | 'Cancelado' | 'Expirado';

export interface TicketResumenDto {
    id: number;
    codigo: string;
    estado: EstadoTicket;
    fechaReserva: string;
    fechaHoraSalida: string;
    rutaNombre: string;
    placaUnidad: string;
}

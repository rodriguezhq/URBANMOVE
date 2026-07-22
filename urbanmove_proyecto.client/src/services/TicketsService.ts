import type { TicketResumenDto } from "../Types/ticketsType";
import { ApiClient } from "./api"

const TicketsService = {
    async obtenerMisTickests(): Promise<TicketResumenDto[]> {
        const response = await ApiClient.get('/tickets/mis_tickets')
        return response.data;
    },
    async validarTicket(codigo: string): Promise<{ mensaje: string }> {
        const response = await ApiClient.post(`/tickets/validar/${codigo}`)
        return response.data;
    }
}

export default TicketsService;
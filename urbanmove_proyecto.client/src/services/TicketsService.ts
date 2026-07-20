import type { TicketResumenDto } from "../Types/ticketsType";
import { ApiClient } from "./api"

const TicketsService = {
    async obtenerMisTickests(): Promise<TicketResumenDto[]> {
        const response = await ApiClient.get('/tickets/mis_tickets')
        return response.data;
    }
}

export default TicketsService;
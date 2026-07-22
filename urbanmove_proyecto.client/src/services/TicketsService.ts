import type { TicketResumenDto } from "../Types/ticketsType";
import { ApiClient, descargarArchivo } from "./api"
import type { ResultadoPaginadoDto } from "../Types/navegacionTypes";

const TicketsService = {
    async obtenerMisTickests(pagina = 1, tamanioPagina = 10): Promise<ResultadoPaginadoDto<TicketResumenDto>> {
        const response = await ApiClient.get(`/tickets/mis_tickets?pagina=${pagina}&tamanioPagina=${tamanioPagina}`)
        return response.data;
    },
    async validarTicket(codigo: string): Promise<{ mensaje: string }> {
        const response = await ApiClient.post(`/tickets/validar/${codigo}`)
        return response.data;
    },
    async exportar(formato: 'csv' | 'xml') {
        await descargarArchivo(`/tickets/exportar?formato=${formato}`, `tickets.${formato}`);
    }
}

export default TicketsService;
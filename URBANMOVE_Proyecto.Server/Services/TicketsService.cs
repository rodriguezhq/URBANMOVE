using Microsoft.EntityFrameworkCore;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Services
{
    public class TicketsService
    {
        private readonly AppDbContext _db;
        private readonly FidelizacionService _fidelizacionService;

        public TicketsService(AppDbContext db, FidelizacionService fidelizacionService)
        {
            _db = db;
            _fidelizacionService = fidelizacionService;
        }
        public async Task<string> ReservarTicketAsync(string usuarioId, int salidaId)
        {
            var salida = await _db.SalidasProgramadas
                .Include(s => s.UnidadTransporte)
                .FirstOrDefaultAsync(s => s.Id == salidaId);
            if (salida == null || salida.Estado != EstadioSalida.Programada)
                throw new Exception("Salida no disponible para reserva.");
            // Contar cuántos tickets ya existen para esta salida
            var ticketsOcupados = await _db.Tickets
                .CountAsync(t => t.SalidaId == salidaId && (t.Estado == EstadoTicket.Reservado || t.Estado == EstadoTicket.Validado));
            if (ticketsOcupados >= salida.UnidadTransporte.Capacidad)
                throw new Exception("Ya no hay asientos disponibles en esta salida.");
            // Generar código único para el QR
            var codigo = $"TKT-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
            var ticket = new Ticket
            {
                Codigo = codigo,
                Estado = EstadoTicket.Reservado,
                FechaReserva = DateTime.UtcNow,
                UsuarioId = usuarioId,
                SalidaId = salidaId,
                UnidadId = salida.UnidadTransporteId,
                OperadorId = null // Queda nulo hasta que el chofer lo valide
            };
            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();
            return codigo;
        }
        public async Task<List<TicketResumenDTO>> ObtenerMisTicketsAsync(string usuarioId)
        {
            return await _db.Tickets
                .Include(t => t.Salida)
                    .ThenInclude(s => s.Ruta)
                .Include(t => t.Unidad)
                .Where(t => t.UsuarioId == usuarioId)
                .OrderByDescending(t => t.FechaReserva)
                .Select(t => new TicketResumenDTO
                {
                    Id = t.Id,
                    Codigo = t.Codigo,
                    Estado = t.Estado.ToString(),
                    FechaReserva = t.FechaReserva,
                    FechaHoraSalida = t.Salida.FechaHoraSalida,
                    RutaNombre = t.Salida.Ruta.Nombre,
                    PlacaUnidad = t.Unidad.Placa
                })
                .ToListAsync();
        }

        public async Task<bool> ValidarTicketAsync(string codigo, string operadorId)
        {
            var ticket = await _db.Tickets
                .FirstOrDefaultAsync(t => t.Codigo == codigo);

            if (ticket == null)
                throw new Exception("El ticket no existe.");

            if (ticket.Estado == EstadoTicket.Validado)
                throw new Exception("El ticket ya fue validado previamente.");

            if (ticket.Estado == EstadoTicket.Cancelado)
                throw new Exception("El ticket se encuentra cancelado.");

            // Cambiamos el estado y asignamos al operador que lo escaneó
            ticket.Estado = EstadoTicket.Validado;
            ticket.OperadorId = operadorId;

            await _db.SaveChangesAsync();

            // Llamar al módulo de fidelización para otorgar los puntos (RF-05)
            await _fidelizacionService.RegistrarPuntosPorTicketValidadoAsync(ticket.Id);

            return true;
        }

        public async Task<List<TicketExportDto>> ObtenerTodosLosTicketsAsync()
        {
            return await _db.Tickets
                .Include(t => t.Salida)
                    .ThenInclude(s => s.Ruta)
                .Include(t => t.Unidad)
                .Include(t => t.Usuario)
                .OrderByDescending(t => t.FechaReserva)
                .Select(t => new TicketExportDto
                {
                    Id = t.Id,
                    Codigo = t.Codigo,
                    Estado = t.Estado.ToString(),
                    FechaReserva = t.FechaReserva,
                    FechaHoraSalida = t.Salida.FechaHoraSalida,
                    RutaNombre = t.Salida.Ruta.Nombre,
                    PlacaUnidad = t.Unidad.Placa,
                    UsuarioNombre = t.Usuario.Nombres + " " + t.Usuario.Apellidos
                })
                .ToListAsync();
        }
    }
}
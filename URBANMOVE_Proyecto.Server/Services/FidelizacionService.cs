using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Services
{
    /// <summary>
    /// Módulo RF-05 – Sistema de puntos eco (fidelización).
    /// Acumulación por uso de rutas validadas y canje en comercios aliados.
    /// </summary>
    public class FidelizacionService
    {
        private readonly AppDbContext _db;

        // Reglas de negocio del módulo (centralizadas aquí para que sean fáciles
        // de encontrar y ajustar si el equipo decide cambiarlas después).
        private const double KmPorPunto = 1.0;      // 1 punto ganado por cada km recorrido
        private const int CostoCanjeEnPuntos = 100; // puntos que cuesta cada canje
        private const decimal DescuentoPorCanje = 5.00m; // S/ que se obtienen por ese canje

        public FidelizacionService(AppDbContext db)
        {
            _db = db;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Saldo e historial del usuario autenticado
        // ──────────────────────────────────────────────────────────────────────

        public async Task<SaldoPuntosResponseDto> ObtenerSaldoAsync(string usuarioId)
        {
            var movimientos = await _db.PuntosLedgers
                .Where(p => p.UsuarioId == usuarioId)
                .OrderByDescending(p => p.Fecha)
                .Select(p => new MovimientoPuntosDto
                {
                    Id = p.Id,
                    Cantidad = p.Cantidad,
                    Tipo = p.Tipo.ToString(),
                    Descripcion = p.Descripcion,
                    Fecha = p.Fecha
                })
                .ToListAsync();

            var saldo = movimientos.Sum(m =>
                m.Tipo == nameof(TipoMovimiento.Ganados) ? m.Cantidad : -m.Cantidad);

            return new SaldoPuntosResponseDto
            {
                SaldoActual = saldo,
                Movimientos = movimientos
            };
        }

        // ──────────────────────────────────────────────────────────────────────
        // "Gancho" de integración: se llamará desde el módulo que valide tickets
        // (RF-02/RF-04) una vez que ese flujo exista. Hoy nadie lo invoca todavía,
        // pero el método ya queda listo y probado de forma independiente.
        // ──────────────────────────────────────────────────────────────────────

        public async Task RegistrarPuntosPorTicketValidadoAsync(int ticketId)
        {
            var ticket = await _db.Tickets
                .Include(t => t.Salida)
                    .ThenInclude(s => s.Ruta)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                throw new InvalidOperationException($"Ticket con Id {ticketId} no encontrado.");

            if (ticket.Estado != EstadoTicket.Validado)
                throw new InvalidOperationException("El ticket debe estar en estado Validado para otorgar puntos.");

            // Evitar doble acreditación si el método se llama más de una vez para el mismo ticket.
            var yaAcreditado = await _db.PuntosLedgers.AnyAsync(p => p.TicketId == ticketId);
            if (yaAcreditado)
                return;

            var distanciaKm = CalcularDistanciaKm(ticket.Salida.Ruta.Recorrido);
            var puntos = Math.Max(1, (int)Math.Floor(distanciaKm / KmPorPunto));

            _db.PuntosLedgers.Add(new PuntosLedger
            {
                UsuarioId = ticket.UsuarioId,
                Usuario = ticket.Usuario,
                TicketId = ticket.Id,
                Ticket = ticket,
                Cantidad = puntos,
                Tipo = TipoMovimiento.Ganados,
                Descripcion = $"Ruta validada: {ticket.Salida.Ruta.Nombre} ({distanciaKm:F1} km)",
                Fecha = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
        }

        // ──────────────────────────────────────────────────────────────────────
        // Canje de puntos en un comercio aliado
        // ──────────────────────────────────────────────────────────────────────

        public async Task<CanjearPuntosResponseDto> CanjearAsync(string usuarioId, int comercioId)
        {
            var comercio = await _db.ComercioAliado.FirstOrDefaultAsync(c => c.Id == comercioId)
                ?? throw new InvalidOperationException("Comercio aliado no encontrado.");

            var saldoActual = await ObtenerSaldoActualAsync(usuarioId);

            if (saldoActual < CostoCanjeEnPuntos)
                throw new InvalidOperationException(
                    $"Saldo insuficiente. Necesitas {CostoCanjeEnPuntos} puntos y tienes {saldoActual}.");

            _db.PuntosLedgers.Add(new PuntosLedger
            {
                UsuarioId = usuarioId,
                Usuario = (await _db.Users.FirstAsync(u => u.Id == usuarioId)),
                ComercioId = comercio.Id,
                Comercio = comercio,
                Cantidad = CostoCanjeEnPuntos,
                Tipo = TipoMovimiento.Canjeados,
                Descripcion = $"Canje en {comercio.Nombre}",
                Fecha = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            return new CanjearPuntosResponseDto
            {
                SaldoRestante = saldoActual - CostoCanjeEnPuntos,
                PuntosCanjeados = CostoCanjeEnPuntos,
                DescuentoSoles = DescuentoPorCanje,
                Comercio = comercio.Nombre
            };
        }

        // ──────────────────────────────────────────────────────────────────────
        // CRUD de comercios aliados (solo admin, validado en el Controller)
        // ──────────────────────────────────────────────────────────────────────

        public async Task<List<ComercioResponseDto>> ListarComerciosAsync()
        {
            return await _db.ComercioAliado
                .Select(c => new ComercioResponseDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Direccion = c.Direccion,
                    Lat = c.Ubicacion.Y,
                    Lng = c.Ubicacion.X
                })
                .ToListAsync();
        }

        public async Task<ComercioResponseDto> CrearComercioAsync(CrearComercioRequest request)
        {
            var geometryFactory = new GeometryFactory(new PrecisionModel(), 0);
            var comercio = new ComercioAliado
            {
                Nombre = request.Nombre,
                Direccion = request.Direccion,
                Ubicacion = geometryFactory.CreatePoint(new Coordinate(request.Lng, request.Lat))
            };

            _db.ComercioAliado.Add(comercio);
            await _db.SaveChangesAsync();

            return new ComercioResponseDto
            {
                Id = comercio.Id,
                Nombre = comercio.Nombre,
                Direccion = comercio.Direccion,
                Lat = request.Lat,
                Lng = request.Lng
            };
        }

        public async Task<bool> ActualizarComercioAsync(int id, ActualizarComercioRequest request)
        {
            var comercio = await _db.ComercioAliado.FirstOrDefaultAsync(c => c.Id == id);
            if (comercio is null) return false;

            var geometryFactory = new GeometryFactory(new PrecisionModel(), 0);
            comercio.Nombre = request.Nombre;
            comercio.Direccion = request.Direccion;
            comercio.Ubicacion = geometryFactory.CreatePoint(new Coordinate(request.Lng, request.Lat));

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarComercioAsync(int id)
        {
            var comercio = await _db.ComercioAliado.FirstOrDefaultAsync(c => c.Id == id);
            if (comercio is null) return false;

            _db.ComercioAliado.Remove(comercio);
            await _db.SaveChangesAsync();
            return true;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Helpers privados
        // ──────────────────────────────────────────────────────────────────────

        private async Task<int> ObtenerSaldoActualAsync(string usuarioId)
        {
            var ganados = await _db.PuntosLedgers
                .Where(p => p.UsuarioId == usuarioId && p.Tipo == TipoMovimiento.Ganados)
                .SumAsync(p => (int?)p.Cantidad) ?? 0;

            var canjeados = await _db.PuntosLedgers
                .Where(p => p.UsuarioId == usuarioId && p.Tipo == TipoMovimiento.Canjeados)
                .SumAsync(p => (int?)p.Cantidad) ?? 0;

            return ganados - canjeados;
        }

        /// <summary>
        /// Calcula la distancia real (en km) de una LineString geográfica sumando
        /// la distancia Haversine entre cada par de coordenadas consecutivas.
        /// Se usa esto en vez de LineString.Length porque las coordenadas están
        /// en grados (lat/lng), y .Length las trataría como un plano cartesiano,
        /// devolviendo un número sin unidad real.
        /// </summary>
        private static double CalcularDistanciaKm(LineString recorrido)
        {
            const double radioTierraKm = 6371.0;
            double total = 0;

            var coords = recorrido.Coordinates;
            for (int i = 0; i < coords.Length - 1; i++)
            {
                var (lng1, lat1) = (coords[i].X, coords[i].Y);
                var (lng2, lat2) = (coords[i + 1].X, coords[i + 1].Y);

                var dLat = DegreesToRadians(lat2 - lat1);
                var dLng = DegreesToRadians(lng2 - lng1);

                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                        + Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2))
                        * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                total += radioTierraKm * c;
            }

            return total;
        }

        private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
    }
}
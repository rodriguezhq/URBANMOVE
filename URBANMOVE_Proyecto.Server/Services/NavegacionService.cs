using Microsoft.EntityFrameworkCore;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Services
{
    /// <summary>
    /// Servicio de navegación: encapsula toda la lógica de búsqueda y filtrado de
    /// rutas para el ciudadano (RF-02).
    /// </summary>
    public class NavegacionService
    {
        private readonly AppDbContext _db;

        public NavegacionService(AppDbContext db)
        {
            _db = db;
        }

        // ──────────────────────────────────────────────────────────────────────────
        // Búsqueda paginada de rutas con filtros combinados
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Busca rutas aplicando los filtros de la request.
        /// La disponibilidad de asientos se calcula en tiempo real:
        ///   AsientosDisponibles = Capacidad - COUNT(Tickets con estado Reservado|Validado)
        /// </summary>
        public async Task<ResultadoPaginadoDto<RutaResumenDto>> BuscarRutasAsync(BusquedaRutasRequest req)
        {
            // ── 1. Base: rutas con su línea y sus paradas ──────────────────────────
            var rutasQuery = _db.Rutas
                .Include(r => r.Linea)
                .Include(r => r.RutaParadas)
                    .ThenInclude(rp => rp.Parada)
                .AsQueryable();

            // ── 2. Filtro por línea ────────────────────────────────────────────────
            if (req.LineaId.HasValue)
                rutasQuery = rutasQuery.Where(r => r.LineaId == req.LineaId.Value);

            // ── 3. Filtro por parada de origen ────────────────────────────────────
            if (req.OrigenParadaId.HasValue)
                rutasQuery = rutasQuery.Where(r =>
                    r.RutaParadas.Any(rp => rp.ParadaId == req.OrigenParadaId.Value));

            // ── 4. Filtro por parada de destino ───────────────────────────────────
            if (req.DestinoParadaId.HasValue)
                rutasQuery = rutasQuery.Where(r =>
                    r.RutaParadas.Any(rp => rp.ParadaId == req.DestinoParadaId.Value));

            // ── 5. Si se filtró origen Y destino, validar que el origen va antes ─
            // (el orden de la parada de origen debe ser menor al del destino)
            if (req.OrigenParadaId.HasValue && req.DestinoParadaId.HasValue)
            {
                rutasQuery = rutasQuery.Where(r =>
                    r.RutaParadas.First(rp => rp.ParadaId == req.OrigenParadaId.Value).Orden
                    <
                    r.RutaParadas.First(rp => rp.ParadaId == req.DestinoParadaId.Value).Orden
                );
            }

            // ── 6. Paginación del total de rutas ──────────────────────────────────
            var totalRutas = await rutasQuery.CountAsync();
            var pagina = Math.Max(1, req.Pagina);
            var tamanio = Math.Clamp(req.TamanioPagina, 1, 50);

            var rutas = await rutasQuery
                .OrderBy(r => r.LineaId).ThenBy(r => r.Nombre)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            var rutaIds = rutas.Select(r => r.Id).ToList();

            // ── 7. Salidas con sus tickets (para calcular asientos) ───────────────
            var salidasQuery = _db.SalidasProgramadas
                .Include(s => s.UnidadTransporte)
                .Include(s => s.Ruta)
                .Where(s => rutaIds.Contains(s.RutaId)
                         && s.Estado != EstadioSalida.Cancelada
                         && s.Estado != EstadioSalida.Finalizada)
                .AsQueryable();

            // Filtro horario
            if (req.FechaHoraDesde.HasValue)
                salidasQuery = salidasQuery.Where(s => s.FechaHoraSalida >= req.FechaHoraDesde.Value);
            if (req.FechaHoraHasta.HasValue)
                salidasQuery = salidasQuery.Where(s => s.FechaHoraSalida <= req.FechaHoraHasta.Value);

            var salidas = await salidasQuery
                .OrderBy(s => s.FechaHoraSalida)
                .ToListAsync();

            var salidaIds = salidas.Select(s => s.Id).ToList();

            // Tickets activos agrupados por salida (para calcular ocupación)
            var ticketsPorSalida = await _db.Tickets
                .Where(t => salidaIds.Contains(t.SalidaId)
                         && (t.Estado == EstadoTicket.Reservado || t.Estado == EstadoTicket.Validado))
                .GroupBy(t => t.SalidaId)
                .Select(g => new { SalidaId = g.Key, Ocupados = g.Count() })
                .ToDictionaryAsync(x => x.SalidaId, x => x.Ocupados);

            // ── 8. Construir DTOs ─────────────────────────────────────────────────
            var resultado = new List<RutaResumenDto>();

            foreach (var ruta in rutas)
            {
                var salidasDeLaRuta = salidas
                    .Where(s => s.RutaId == ruta.Id)
                    .Select(s =>
                    {
                        var ocupados = ticketsPorSalida.GetValueOrDefault(s.Id, 0);
                        var disponibles = s.UnidadTransporte.Capacidad - ocupados;
                        return new SalidaDto
                        {
                            Id = s.Id,
                            FechaHoraSalida = s.FechaHoraSalida,
                            FechaHoraLlegadaEstimada = s.FechaHoraLlegadaEstimada,
                            Estado = s.Estado.ToString(),
                            PlacaUnidad = s.UnidadTransporte.Placa,
                            CapacidadTotal = s.UnidadTransporte.Capacidad,
                            AsientosOcupados = ocupados,
                            AsientosDisponibles = Math.Max(0, disponibles)
                        };
                    })
                    .ToList();

                // Filtro de disponibilidad post-cálculo
                if (req.SoloConAsientos && salidasDeLaRuta.All(s => s.AsientosDisponibles == 0))
                    continue;

                resultado.Add(new RutaResumenDto
                {
                    Id = ruta.Id,
                    Nombre = ruta.Nombre,
                    Linea = new LineaDto { Id = ruta.Linea.Id, Nombre = ruta.Linea.Nombre },
                    Paradas = ruta.RutaParadas
                        .OrderBy(rp => rp.Orden)
                        .Select(rp => new RutaParadaDto
                        {
                            Orden = rp.Orden,
                            Parada = new ParadaDto
                            {
                                Id = rp.Parada.Id,
                                Nombre = rp.Parada.Nombre,
                                Lat = rp.Parada.Ubicacion.Y,
                                Lng = rp.Parada.Ubicacion.X
                            }
                        })
                        .ToList(),
                    Salidas = salidasDeLaRuta
                });
            }

            return new ResultadoPaginadoDto<RutaResumenDto>
            {
                PaginaActual = pagina,
                TamanioPagina = tamanio,
                TotalRegistros = totalRutas,
                TotalPaginas = (int)Math.Ceiling((double)totalRutas / tamanio),
                Datos = resultado
            };
        }

        // ──────────────────────────────────────────────────────────────────────────
        // Detalle de una ruta específica
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Retorna el detalle de una ruta con sus paradas ordenadas y salidas del día.
        /// </summary>
        public async Task<RutaResumenDto?> ObtenerDetalleRutaAsync(int rutaId)
        {
            var ruta = await _db.Rutas
                .Include(r => r.Linea)
                .Include(r => r.RutaParadas)
                    .ThenInclude(rp => rp.Parada)
                .FirstOrDefaultAsync(r => r.Id == rutaId);

            if (ruta is null) return null;

            // Mostramos salidas de los próximos 7 días (no solo hoy)
            var ahora  = DateTime.UtcNow;
            var limite = ahora.AddDays(7);

            var salidas = await _db.SalidasProgramadas
                .Include(s => s.UnidadTransporte)
                .Where(s => s.RutaId == rutaId
                         && s.FechaHoraSalida >= ahora
                         && s.FechaHoraSalida <= limite
                         && s.Estado != EstadioSalida.Cancelada)
                .OrderBy(s => s.FechaHoraSalida)
                .ToListAsync();

            var salidaIds = salidas.Select(s => s.Id).ToList();

            var ticketsPorSalida = await _db.Tickets
                .Where(t => salidaIds.Contains(t.SalidaId)
                         && (t.Estado == EstadoTicket.Reservado || t.Estado == EstadoTicket.Validado))
                .GroupBy(t => t.SalidaId)
                .Select(g => new { SalidaId = g.Key, Ocupados = g.Count() })
                .ToDictionaryAsync(x => x.SalidaId, x => x.Ocupados);

            return new RutaResumenDto
            {
                Id = ruta.Id,
                Nombre = ruta.Nombre,
                Linea = new LineaDto { Id = ruta.Linea.Id, Nombre = ruta.Linea.Nombre },
                Paradas = ruta.RutaParadas
                    .OrderBy(rp => rp.Orden)
                    .Select(rp => new RutaParadaDto
                    {
                        Orden = rp.Orden,
                        Parada = new ParadaDto
                        {
                            Id = rp.Parada.Id,
                            Nombre = rp.Parada.Nombre,
                            Lat = rp.Parada.Ubicacion.Y,
                            Lng = rp.Parada.Ubicacion.X
                        }
                    })
                    .ToList(),
                Salidas = salidas.Select(s =>
                {
                    var ocupados = ticketsPorSalida.GetValueOrDefault(s.Id, 0);
                    return new SalidaDto
                    {
                        Id = s.Id,
                        FechaHoraSalida = s.FechaHoraSalida,
                        FechaHoraLlegadaEstimada = s.FechaHoraLlegadaEstimada,
                        Estado = s.Estado.ToString(),
                        PlacaUnidad = s.UnidadTransporte.Placa,
                        CapacidadTotal = s.UnidadTransporte.Capacidad,
                        AsientosOcupados = ocupados,
                        AsientosDisponibles = Math.Max(0, s.UnidadTransporte.Capacidad - ocupados)
                    };
                }).ToList()
            };
        }

        // ──────────────────────────────────────────────────────────────────────────
        // Listados auxiliares
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>Retorna todas las líneas (para poblar selects en el frontend).</summary>
        public async Task<List<LineaDto>> ObtenerLineasAsync()
        {
            return await _db.Lineas
                .OrderBy(l => l.Nombre)
                .Select(l => new LineaDto { Id = l.Id, Nombre = l.Nombre })
                .ToListAsync();
        }

        /// <summary>
        /// Retorna paradas filtrando por nombre (búsqueda tipo autocomplete).
        /// </summary>
        public async Task<List<ParadaDto>> ObtenerParadasAsync(string? query)
        {
            var q = _db.Paradas.AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
                q = q.Where(p => p.Nombre.Contains(query));

            return await q
                .OrderBy(p => p.Nombre)
                .Take(30)
                .Select(p => new ParadaDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Lat = p.Ubicacion.Y,
                    Lng = p.Ubicacion.X
                })
                .ToListAsync();
        }
    }
}

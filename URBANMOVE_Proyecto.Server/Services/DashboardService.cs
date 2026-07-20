using Microsoft.EntityFrameworkCore;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Services
{
    /// <summary>
    /// Servicio del dashboard del operador (RF-04): reúne KPIs, estado de unidades,
    /// programación de frecuencias, alertas de desviación y datos para el mapa.
    /// No modifica la base de datos, solo lee y calcula.
    /// </summary>
    public class DashboardService
    {
        private readonly AppDbContext _db;

        public DashboardService(AppDbContext db)
        {
            _db = db;
        }

        // ──────────────────────────────────────────────────────────────────────────
        // Resumen completo del dashboard
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Construye el resumen del dashboard: KPIs, unidades, frecuencias próximas
        /// (siguientes 7 días), alertas y puntos para el mapa.
        /// </summary>
        public async Task<DashboardResumenDto> ObtenerResumenAsync()
        {
            var ahora = DateTime.UtcNow;
            var limite = ahora.AddDays(7);

            // ── 1. Unidades ────────────────────────────────────────────────────────
            var unidades = await _db.UnidadesTransporte
                .OrderBy(u => u.Placa)
                .ToListAsync();

            // ── 2. Salidas próximas (siguientes 7 días, no canceladas) ─────────────
            var salidas = await _db.SalidasProgramadas
                .Include(s => s.Ruta).ThenInclude(r => r.Linea)
                .Include(s => s.UnidadTransporte)
                .Where(s => s.FechaHoraSalida >= ahora
                         && s.FechaHoraSalida <= limite
                         && s.Estado != EstadioSalida.Cancelada
                         && s.Estado != EstadioSalida.Finalizada)
                .OrderBy(s => s.FechaHoraSalida)
                .ToListAsync();

            var salidaIds = salidas.Select(s => s.Id).ToList();

            // Ocupación: tickets activos agrupados por salida
            var ticketsPorSalida = await _db.Tickets
                .Where(t => salidaIds.Contains(t.SalidaId)
                         && (t.Estado == EstadoTicket.Reservado || t.Estado == EstadoTicket.Validado))
                .GroupBy(t => t.SalidaId)
                .Select(g => new { SalidaId = g.Key, Ocupados = g.Count() })
                .ToDictionaryAsync(x => x.SalidaId, x => x.Ocupados);

            // ── 3. Salidas en curso ahora mismo (para KPI y estado de unidades) ────
            var salidasEnCurso = await _db.SalidasProgramadas
                .Include(s => s.Ruta)
                .Include(s => s.UnidadTransporte)
                .Where(s => s.Estado == EstadioSalida.EnCurso)
                .ToListAsync();

            // ── 4. Incidentes pendientes (para KPI, alertas y mapa) ────────────────
            var incidentes = await _db.Incidentes
                .Include(i => i.Usuario)
                .OrderByDescending(i => i.FechaRegistro)
                .ToListAsync();

            var incidentesPendientes = incidentes
                .Where(i => i.Estado == EstadoIncidente.Pendiente)
                .ToList();

            // ── 5. Frecuencias (tabla de programación) ─────────────────────────────
            var frecuencias = salidas.Select(s => new FrecuenciaDto
            {
                SalidaId = s.Id,
                Ruta = s.Ruta.Nombre,
                Linea = s.Ruta.Linea.Nombre,
                PlacaUnidad = s.UnidadTransporte.Placa,
                FechaHoraSalida = s.FechaHoraSalida,
                FechaHoraLlegadaEstimada = s.FechaHoraLlegadaEstimada,
                Estado = s.Estado.ToString(),
                AsientosOcupados = ticketsPorSalida.GetValueOrDefault(s.Id, 0),
                CapacidadTotal = s.UnidadTransporte.Capacidad
            }).ToList();

            // ── 6. Estado de unidades ──────────────────────────────────────────────
            var unidadesEstado = unidades.Select(u =>
            {
                var enCurso = salidasEnCurso.FirstOrDefault(s => s.UnidadTransporteId == u.Id);
                return new UnidadEstadoDto
                {
                    Id = u.Id,
                    Placa = u.Placa,
                    Capacidad = u.Capacidad,
                    Activa = u.Activa,
                    VelocidadPromedioKmH = u.VelocidadPromedioKmH,
                    SalidaActual = enCurso is null ? null : $"{enCurso.Ruta.Nombre}"
                };
            }).ToList();

            // ── 7. Alertas de desviación ───────────────────────────────────────────
            // a) Salidas EnCurso cuya hora estimada de llegada ya pasó → retraso.
            var alertas = salidasEnCurso
                .Where(s => ahora > s.FechaHoraLlegadaEstimada)
                .Select(s => new AlertaDto
                {
                    Tipo = "Retraso",
                    Mensaje = $"Unidad {s.UnidadTransporte.Placa} en ruta \"{s.Ruta.Nombre}\" supera su hora estimada de llegada.",
                    Fecha = s.FechaHoraLlegadaEstimada
                })
                .ToList();

            // b) Incidentes pendientes reportados por ciudadanos.
            alertas.AddRange(incidentesPendientes.Select(i => new AlertaDto
            {
                Tipo = "Incidente",
                Mensaje = $"{i.Categoria}: {i.descripcion}",
                Fecha = i.FechaRegistro
            }));

            alertas = alertas.OrderByDescending(a => a.Fecha).ToList();

            // ── 8. Mapa: paradas + incidentes geolocalizados ───────────────────────
            var paradasMapa = await _db.Paradas
                .OrderBy(p => p.Nombre)
                .Select(p => new PuntoMapaDto
                {
                    Nombre = p.Nombre,
                    Lat = p.Ubicacion.Y,
                    Lng = p.Ubicacion.X
                })
                .ToListAsync();

            var incidentesMapa = incidentes.Select(i => new IncidenteMapaDto
            {
                Id = i.Id,
                Descripcion = i.descripcion,
                Categoria = i.Categoria.ToString(),
                Estado = i.Estado.ToString(),
                Lat = i.Ubicacion.Y,
                Lng = i.Ubicacion.X,
                FechaRegistro = i.FechaRegistro
            }).ToList();

            // ── 9. KPIs ────────────────────────────────────────────────────────────
            var ocupacionPromedio = 0;
            if (frecuencias.Count > 0)
            {
                var porcentajes = frecuencias
                    .Where(f => f.CapacidadTotal > 0)
                    .Select(f => (double)f.AsientosOcupados / f.CapacidadTotal * 100);
                if (porcentajes.Any())
                    ocupacionPromedio = (int)Math.Round(porcentajes.Average());
            }

            var kpis = new DashboardKpisDto
            {
                UnidadesActivas = unidades.Count(u => u.Activa),
                UnidadesTotal = unidades.Count,
                SalidasEnCurso = salidasEnCurso.Count,
                SalidasProximas = salidas.Count,
                IncidentesPendientes = incidentesPendientes.Count,
                OcupacionPromedio = ocupacionPromedio
            };

            return new DashboardResumenDto
            {
                Kpis = kpis,
                Unidades = unidadesEstado,
                Frecuencias = frecuencias,
                Alertas = alertas,
                Mapa = new DashboardMapaDto
                {
                    Paradas = paradasMapa,
                    Incidentes = incidentesMapa
                }
            };
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [ApiController]
    [Route("rutas")]
    public class RutasController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly RoutingService _routingService;

        public RutasController(AppDbContext dbContext, RoutingService routingService)
        {
            _dbContext = dbContext;
            _routingService = routingService;
        }

        [HttpPost("routing")]
        [Authorize(Roles = "admin,operador")]
        public async Task<IActionResult> GetRoutingData([FromBody] CalculateRuteRequest request)
        {
            if (request.Coordinates.Count < 2)
            {
                return BadRequest("At least two coordinates are required to calculate a route.");
            }

            try
            {

                var routeResult = await _routingService.CalculateRouteAsync(request.Coordinates, request.CancellationToken);
                string lineGeoJson = new GeoJsonWriter().Write(routeResult.Geometry);

                return Ok(new
                {
                    Geometry = lineGeoJson,
                    DistanceMeters = routeResult.DistanceMeters,
                    DurationSeconds = routeResult.DurationSeconds
                });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error calculating route: {ex.Message}");
            }

        }
        [HttpPost("guardar")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GuardarRuta([FromBody] CrearRutaRequest request)
        {
            try
            {
                var reader = new GeoJsonReader();
                var geometry = reader.Read<LineString>(request.GeoJsonRecorrido);
                geometry.SRID = 4326;
                var nuevaRuta = new Ruta
                {
                    Nombre = request.Nombre,
                    LineaId = request.LineaId,
                    Recorrido = geometry,
                    Linea = null!
                };
                _dbContext.Rutas.Add(nuevaRuta);
                await _dbContext.SaveChangesAsync();
                var orden = 1;
                foreach (var paradaId in request.ParadasIds)
                {
                    _dbContext.RutaParadas.Add(new RutaParada
                    {
                        RutaId = nuevaRuta.Id,
                        ParadaId = paradaId,
                        Orden = orden,
                        Ruta = null!,
                        Parada = null!
                    });
                    orden++;
                }

                await _dbContext.SaveChangesAsync();
                return Ok(new { mensaje = "Ruta creada y guardada exitosamente", rutaId = nuevaRuta.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = $"Error al guardar la ruta: {ex.Message}" });
            }
        }

        [HttpPost("lineas")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CrearLinea([FromBody] LineaCrearRequest request)
        {
            try
            {
                var existe = await _dbContext.Lineas.AnyAsync(l => l.Nombre == request.Nombre);
                if (existe)
                    return BadRequest(new { mensaje = "Ya existe una línea con ese nombre." });

                var linea = new Linea { Nombre = request.Nombre };
                _dbContext.Lineas.Add(linea);
                await _dbContext.SaveChangesAsync();

                return Ok(new { mensaje = "Línea creada exitosamente", lineaId = linea.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = $"Error al crear la línea: {ex.Message}" });
            }
        }

        [HttpPost("paradas")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CrearParada([FromBody] ParadaCrearRequest request)
        {
            try
            {
                var existe = await _dbContext.Paradas.AnyAsync(p => p.Nombre == request.Nombre);
                if (existe)
                    return BadRequest(new { mensaje = "Ya existe una parada con ese nombre." });

                var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var punto = gf.CreatePoint(new Coordinate(request.Lng, request.Lat));

                var parada = new Parada { Nombre = request.Nombre, Ubicacion = punto };
                _dbContext.Paradas.Add(parada);
                await _dbContext.SaveChangesAsync();

                return Ok(new { mensaje = "Parada creada exitosamente", paradaId = parada.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = $"Error al crear la parada: {ex.Message}" });
            }
        }

        [HttpGet("")]
        [Authorize(Roles = "admin")]
        [ProducesResponseType<List<RutaListItemDto>>(StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarRutas()
        {
            var rutas = await _dbContext.Rutas
                .Include(r => r.Linea)
                .Include(r => r.RutaParadas)
                .Select(r => new RutaListItemDto
                {
                    Id = r.Id,
                    Nombre = r.Nombre,
                    LineaNombre = r.Linea.Nombre,
                    CantidadParadas = r.RutaParadas.Count
                })
                .ToListAsync();

            return Ok(rutas);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> EliminarRuta(int id)
        {
            var ruta = await _dbContext.Rutas.FindAsync(id);
            if (ruta == null)
                return NotFound(new { mensaje = "Ruta no encontrada" });

            _dbContext.Rutas.Remove(ruta);
            await _dbContext.SaveChangesAsync();

            return Ok(new { mensaje = "Ruta eliminada exitosamente" });
        }

        [HttpGet("exportar")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Exportar([FromQuery] string formato = "csv")
        {
            var rutas = await _dbContext.Rutas
                .Include(r => r.Linea)
                .Include(r => r.RutaParadas)
                .Select(r => new RutaListItemDto
                {
                    Id = r.Id,
                    Nombre = r.Nombre,
                    LineaNombre = r.Linea.Nombre,
                    CantidadParadas = r.RutaParadas.Count
                })
                .ToListAsync();

            if (formato == "xml")
            {
                var xml = ExportHelper.ToXml(rutas, "Rutas");
                return File(System.Text.Encoding.UTF8.GetBytes(xml), "application/xml", "rutas.xml");
            }

            var csv = ExportHelper.ToCsvBytes(rutas);
            return File(csv, "text/csv; charset=utf-8", "rutas.csv");
        }
    }
}
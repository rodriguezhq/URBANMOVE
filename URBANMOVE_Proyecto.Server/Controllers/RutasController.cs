using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    }
}
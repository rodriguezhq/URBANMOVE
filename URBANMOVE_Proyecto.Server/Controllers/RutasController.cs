using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [ApiController]
    [Route("api/rutas")]
    public class RutasController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly RoutingService _routingService;

        public RutasController(AppDbContext dbContext, RoutingService routingService)
        {
            _dbContext = dbContext;
            _routingService = routingService;
        }

        [HttpGet("routing")]
        [Authorize(Roles = "admin,operador")]
        public async Task<IActionResult> GetRoutingData([FromQuery] CalculateRuteRequest request)
        {
            if (request.Coordinates.Count < 2)
            {
                return BadRequest("At least two coordinates are required to calculate a route.");
            }

            try
            {

                var routeResult = await _routingService.CalculateRouteAsync(request.Coordinates, request.CancellationToken);

                return Ok(new
                {
                    Geometry = routeResult.Geometry,
                    DistanceMeters = routeResult.DistanceMeters,
                    DurationSeconds = routeResult.DurationSeconds
                });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error calculating route: {ex.Message}");
            }

        }
    }
}
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [ApiController]
    [Route("incidentes")]
    [Authorize]
    public class IncidentesController : ControllerBase
    {
        private readonly IncidentesService _incidentes;

        public IncidentesController(IncidentesService incidentes)
        {
            _incidentes = incidentes;
        }

        private string UsuarioId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        private string Rol => User.FindFirstValue(ClaimTypes.Role) ?? "";

        [HttpPost]
        [Authorize(Roles = Roles.Ciudadano)]
        [ProducesResponseType<IncidenteResponseDto>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Crear([FromForm] CrearIncidenteRequest request)
        {
            try
            {
                var incidente = await _incidentes.CrearAsync(UsuarioId, request);
                return CreatedAtAction(nameof(ObtenerDetalle), new { id = incidente.Id }, incidente);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [ProducesResponseType<List<IncidenteResponseDto>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Listar(
            [FromQuery] CategoriaIncidente? categoria,
            [FromQuery] EstadoIncidente? estado)
        {
            var lista = await _incidentes.ListarAsync(UsuarioId, Rol, categoria, estado);
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType<IncidenteResponseDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerDetalle(int id)
        {
            var incidente = await _incidentes.ObtenerDetalleAsync(id, UsuarioId, Rol);
            if (incidente is null)
                return NotFound(new { message = $"Incidente con Id {id} no encontrado." });

            return Ok(incidente);
        }

        [HttpPatch("{id:int}/estado")]
        [Authorize(Roles = "admin,operador")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoRequest request)
        {
            var actualizado = await _incidentes.ActualizarEstadoAsync(id, request.Estado);
            if (!actualizado)
                return NotFound(new { message = $"Incidente con Id {id} no encontrado." });

            return Ok(new { message = "Estado actualizado correctamente" });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin,operador")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Eliminar(int id)
        {
            var eliminado = await _incidentes.EliminarAsync(id);
            if (!eliminado)
                return NotFound(new { message = $"Incidente con Id {id} no encontrado." });

            return Ok(new { message = "Incidente eliminado correctamente" });
        }
    }
}
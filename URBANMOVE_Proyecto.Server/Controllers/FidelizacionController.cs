using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    /// <summary>
    /// Módulo RF-05 – Sistema de puntos eco (fidelización).
    /// </summary>
    [ApiController]
    [Route("fidelizacion")]
    [Authorize]
    public class FidelizacionController : ControllerBase
    {
        private readonly FidelizacionService _fidelizacion;

        public FidelizacionController(FidelizacionService fidelizacion)
        {
            _fidelizacion = fidelizacion;
        }

        private string UsuarioId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // ────────────────────────────────────────────────────────────────────
        // GET /fidelizacion/saldo
        // ────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Saldo actual e historial de movimientos de puntos del usuario autenticado.
        /// </summary>
        [HttpGet("saldo")]
        [Authorize(Roles = Roles.Ciudadano)]
        [ProducesResponseType<SaldoPuntosResponseDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObtenerSaldo()
        {
            var saldo = await _fidelizacion.ObtenerSaldoAsync(UsuarioId);
            return Ok(saldo);
        }

        // ────────────────────────────────────────────────────────────────────
        // GET /fidelizacion/comercios
        // ────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Lista los comercios aliados disponibles para canje. Visible para todos los roles.
        /// </summary>
        [HttpGet("comercios")]
        [ProducesResponseType<List<ComercioResponseDto>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ListarComercios()
        {
            var comercios = await _fidelizacion.ListarComerciosAsync();
            return Ok(comercios);
        }

        // ────────────────────────────────────────────────────────────────────
        // POST /fidelizacion/canjear
        // ────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Canjea puntos del usuario autenticado en un comercio aliado.
        /// </summary>
        [HttpPost("canjear")]
        [Authorize(Roles = Roles.Ciudadano)]
        [ProducesResponseType<CanjearPuntosResponseDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Canjear([FromBody] CanjearPuntosRequest request)
        {
            try
            {
                var resultado = await _fidelizacion.CanjearAsync(UsuarioId, request.ComercioId);
                return Ok(resultado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ────────────────────────────────────────────────────────────────────
        // CRUD de comercios aliados — solo admin
        // ────────────────────────────────────────────────────────────────────

        [HttpPost("comercios")]
        [Authorize(Roles = Roles.Admin)]
        [ProducesResponseType<ComercioResponseDto>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CrearComercio([FromBody] CrearComercioRequest request)
        {
            var comercio = await _fidelizacion.CrearComercioAsync(request);
            return CreatedAtAction(nameof(ListarComercios), new { id = comercio.Id }, comercio);
        }

        [HttpPut("comercios/{id:int}")]
        [Authorize(Roles = Roles.Admin)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ActualizarComercio(int id, [FromBody] ActualizarComercioRequest request)
        {
            var actualizado = await _fidelizacion.ActualizarComercioAsync(id, request);
            if (!actualizado)
                return NotFound(new { message = $"Comercio con Id {id} no encontrado." });

            return Ok(new { message = "Comercio actualizado correctamente" });
        }

        [HttpDelete("comercios/{id:int}")]
        [Authorize(Roles = Roles.Admin)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> EliminarComercio(int id)
        {
            var eliminado = await _fidelizacion.EliminarComercioAsync(id);
            if (!eliminado)
                return NotFound(new { message = $"Comercio con Id {id} no encontrado." });

            return Ok(new { message = "Comercio eliminado correctamente" });
        }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    /// <summary>
    /// Módulo RF-02 – Búsqueda y filtrado de rutas.
    /// Acceso exclusivo para ciudadanos autenticados.
    /// </summary>
    [ApiController]
    [Route("navegacion")]
    [Authorize(Roles = "ciudadano,admin,operador")]
    public class NavegacionController : ControllerBase
    {
        private readonly NavegacionService _navegacion;

        public NavegacionController(NavegacionService navegacion)
        {
            _navegacion = navegacion;
        }

        // ──────────────────────────────────────────────────────────────────────────
        // GET /api/navegacion/rutas
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Búsqueda paginada de rutas con filtros opcionales.
        /// Parámetros (todos opcionales):
        ///   - OrigenParadaId   → Id de la parada de origen
        ///   - DestinoParadaId  → Id de la parada de destino
        ///   - LineaId          → Filtrar por línea
        ///   - FechaHoraDesde   → Inicio del rango horario (UTC)
        ///   - FechaHoraHasta   → Fin del rango horario (UTC)
        ///   - SoloConAsientos  → true = solo salidas con asientos disponibles
        ///   - Pagina           → Número de página (default: 1)
        ///   - TamanioPagina    → Resultados por página (default: 10, máx: 50)
        /// </summary>
        [HttpGet("rutas")]
        [ProducesResponseType<ResultadoPaginadoDto<RutaResumenDto>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> BuscarRutas([FromQuery] BusquedaRutasRequest filtros)
        {
            var resultado = await _navegacion.BuscarRutasAsync(filtros);
            return Ok(resultado);
        }

        // ──────────────────────────────────────────────────────────────────────────
        // GET /api/navegacion/rutas/{id}
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Detalle de una ruta: sus paradas ordenadas + salidas programadas del día actual.
        /// </summary>
        [HttpGet("rutas/{id:int}")]
        [ProducesResponseType<RutaResumenDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerDetalleRuta(int id)
        {
            var ruta = await _navegacion.ObtenerDetalleRutaAsync(id);
            if (ruta is null)
                return NotFound(new { message = $"Ruta con Id {id} no encontrada." });

            return Ok(ruta);
        }

        // ──────────────────────────────────────────────────────────────────────────
        // GET /api/navegacion/lineas
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Lista todas las líneas de transporte disponibles.
        /// Usado para poblar el selector de líneas en el frontend.
        /// </summary>
        [HttpGet("lineas")]
        [ProducesResponseType<List<LineaDto>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObtenerLineas()
        {
            var lineas = await _navegacion.ObtenerLineasAsync();
            return Ok(lineas);
        }

        // ──────────────────────────────────────────────────────────────────────────
        // GET /api/navegacion/paradas?q={texto}
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Busca paradas por nombre (autocomplete).
        /// Parámetros:
        ///   - q → texto parcial del nombre de la parada (opcional)
        /// Retorna máximo 30 resultados ordenados por nombre.
        /// </summary>
        [HttpGet("paradas")]
        [ProducesResponseType<List<ParadaDto>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObtenerParadas([FromQuery] string? q)
        {
            var paradas = await _navegacion.ObtenerParadasAsync(q);
            return Ok(paradas);
        }
    }
}

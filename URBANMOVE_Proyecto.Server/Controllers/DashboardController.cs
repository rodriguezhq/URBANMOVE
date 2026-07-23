using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    /// <summary>
    /// Módulo RF-04 – Dashboard de operaciones.
    /// Acceso para operadores y administradores autenticados.
    /// </summary>
    [ApiController]
    [Route("api/dashboard")]
    [Authorize(Roles = "operador,admin")]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboard;

        public DashboardController(DashboardService dashboard)
        {
            _dashboard = dashboard;
        }

        // ──────────────────────────────────────────────────────────────────────────
        // GET /api/dashboard/resumen
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Retorna el resumen completo del dashboard: KPIs, estado de unidades,
        /// programación de frecuencias, alertas de desviación y puntos del mapa.
        /// </summary>
        [HttpGet("resumen")]
        [ProducesResponseType<DashboardResumenDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ObtenerResumen()
        {
            var resumen = await _dashboard.ObtenerResumenAsync();
            return Ok(resumen);
        }
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [Route("tickets")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly TicketsService _ticketsService;
        public TicketsController(TicketsService ticketsService)
        {
            _ticketsService = ticketsService;
        }
        [Authorize(Roles = "ciudadano")]
        [HttpPost("reservar/{salidaId}")]
        public async Task<IActionResult> Reservar(int salidaId)
        {
            try
            {
                var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (usuarioId == null) return Unauthorized();
                var codigo = await _ticketsService.ReservarTicketAsync(usuarioId, salidaId);
                return Ok(new { mensaje = "Reserva exitosa", codigo });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
        [Authorize(Roles = "ciudadano")]
        [HttpGet("mis_tickets")]
        public async Task<IActionResult> ObtenerMisTickets([FromQuery] int pagina = 1, [FromQuery] int tamanioPagina = 10)
        {
            try
            {
                var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (usuarioId == null) return Unauthorized();

                var tickets = await _ticketsService.ObtenerMisTicketsAsync(usuarioId, pagina, tamanioPagina);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [Authorize(Roles = "operador,admin")]
        [HttpPost("validar/{codigo}")]
        public async Task<IActionResult> Validar(string codigo)
        {
            try
            {
                var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (usuarioId == null) return Unauthorized();

                await _ticketsService.ValidarTicketAsync(codigo, usuarioId);
                return Ok(new { mensaje = "Ticket validado exitosamente. Puntos asignados." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
        [Authorize(Roles = "admin")]
        [HttpGet("exportar")]
        public async Task<IActionResult> Exportar([FromQuery] string formato = "csv")
        {
            try
            {
                var tickets = await _ticketsService.ObtenerTodosLosTicketsAsync();

                if (formato == "xml")
                {
                    var xml = ExportHelper.ToXml(tickets, "Tickets");
                    return File(System.Text.Encoding.UTF8.GetBytes(xml), "application/xml", "tickets.xml");
                }

                var csv = ExportHelper.ToCsvBytes(tickets);
                return File(csv, "text/csv; charset=utf-8", "tickets.csv");
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

    }
}
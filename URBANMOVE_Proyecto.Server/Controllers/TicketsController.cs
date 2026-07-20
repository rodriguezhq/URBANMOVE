using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<IActionResult> ObtenerMisTickets()
        {
            try
            {
                var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (usuarioId == null) return Unauthorized();

                var tickets = await _ticketsService.ObtenerMisTicketsAsync(usuarioId);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

    }
}
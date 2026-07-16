using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetHealthStatus()
        {
            return Ok(new { status = "Healthy" });
        }
    }
}

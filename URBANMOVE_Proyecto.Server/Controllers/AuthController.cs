using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost(Name ="")]
        public async Task<IActionResult> Login([FromBody]LoginRequest loginRequest)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
            if (user == null)
                return Unauthorized(new { message = "Credenciales inválidas" });

            if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
                return Unauthorized(new { message = "Credenciales inválidas" });
            
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.FullName),
                new(ClaimTypes.Email, user.Email)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTime.UtcNow.AddDays(7)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
            return Ok(new
            {
                message = "Inicio de sesión exitoso",
                user = new { user.Id, user.FullName, user.Email }
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Sesión cerrada" });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var fullName = User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email);
            return Ok(new
            {
                id = userId,
                fullName,
                email
            });
        }
    }
}

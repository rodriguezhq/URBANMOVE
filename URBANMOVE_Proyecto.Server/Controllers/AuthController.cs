using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
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
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;

        public AuthController(UserManager<Usuario> userManager, SignInManager<Usuario> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost()]
        [ProducesResponseType<MeResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);

            if (user == null)
                return Unauthorized(new { message = "Credenciales inválidas" });

            if (!await _userManager.CheckPasswordAsync(user, loginRequest.Password))
                return Unauthorized(new { message = "Credenciales inválidas" });

            await _signInManager.SignInAsync(user, isPersistent: true);

            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, $"{user.Nombres} {user.Apellidos}"),
                new(ClaimTypes.Email, user.Email ?? ""),
                new(ClaimTypes.Role, roles.FirstOrDefault() ?? Roles.Ciudadano),
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            };

            await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties
                  );

            return Ok(new LoginResponse
            {
                Id = user.Id,
                FullName = $"{user.Nombres} {user.Apellidos}",
                Email = user.Email ?? "",
                Role = roles.FirstOrDefault() ?? Roles.Ciudadano,
                Message = "Inicio de sesión exitoso"
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Sesión cerrada" });
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType<MeResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var fullName = User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var role = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new MeResponse
            {
                Id = userId ?? "",
                FullName = fullName ?? "",
                Email = email ?? "",
                Role = role ?? ""
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request){
            if(request.Password != request.ConfirmPassword){
                 return BadRequest(new {message = "Las contraseñas son diferentes"});
            }
            
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if(existingUser != null){
                return BadRequest(new {message = "El correo ya está registrado"});
            }

            var existingUserName = await _userManager.FindByNameAsync(request.UserName);
            if(existingUserName != null){
                return BadRequest(new {message = "Ese nombre de usuario ya está en uso, elige otro"});
            }

            var existingDni = await _userManager.Users.AnyAsync(u => u.DNI == request.DNI);
            if(existingDni){
                return BadRequest(new {message = "Ese DNI ya está registrado"});
            }

            var user = new Usuario{
                UserName = request.UserName,
                Email = request.Email,
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                DNI = request.DNI,
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if(!result.Succeeded){
                var errors = string.Join(",",result.Errors.Select(e => e.Description));
                return BadRequest(new {message = errors});
            }

            await _userManager.AddToRoleAsync(user, Roles.Ciudadano);
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new LoginResponse{
                Id = user.Id,
                FullName = $"{user.Nombres} {user.Apellidos}",
                Email = user.Email ?? "",
                Role = Roles.Ciudadano,
                Message = "Registro exitoso"
            });
        }
    }
}
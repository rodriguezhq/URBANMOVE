using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;
using URBANMOVE_Proyecto.Server.Services;

namespace URBANMOVE_Proyecto.Server.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly EmailService _emailService;
        private readonly IOptions<GeneralSettings> _generalSettings;

        public AuthController(UserManager<Usuario> userManager, SignInManager<Usuario> signInManager, EmailService emailService, IOptions<GeneralSettings> generalSettings)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
            _generalSettings = generalSettings;
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

            var rolesPrevios = await _userManager.GetRolesAsync(user);
            if (rolesPrevios.Contains(Roles.Operador) && user.EstadoAprobacion != EstadoAprobacion.Aprobado)
            {
                var mensaje = user.EstadoAprobacion == EstadoAprobacion.Pendiente
                    ? "Tu cuenta de operador está pendiente de aprobación por un administrador."
                    : $"Tu solicitud de operador fue rechazada. Motivo: {user.MotivoRechazo}";

                return Unauthorized(new { message = mensaje });
            }

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

            return Ok(new LoginResponse
            {
                Id = user.Id,
                Nombres = user.Nombres,
                Apellidos = user.Apellidos,
                FullName = $"{user.Nombres} {user.Apellidos}",
                Email = user.Email ?? "",
                Role = roles.FirstOrDefault() ?? Roles.Ciudadano,
                Message = "Inicio de sesión exitoso",
                VerifiedEmail = user.EmailConfirmed
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

            var user = _userManager.FindByIdAsync(userId).Result;
            var verifiedEmail = user?.EmailConfirmed ?? false;

            return Ok(new MeResponse
            {
                Id = userId ?? "",
                Nombres = user?.Nombres ?? "",
                Apellidos = user?.Apellidos ?? "",
                FullName = fullName ?? "",
                Email = email ?? "",
                Role = role ?? "",
                VerifiedEmail = verifiedEmail
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new { message = "Las contraseñas son diferentes" });
            }

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "El correo ya está registrado" });
            }

            var existingDni = await _userManager.Users.AnyAsync(u => u.DNI == request.DNI);
            if (existingDni)
            {
                return BadRequest(new { message = "Ese DNI ya está registrado" });
            }

            var user = new Usuario
            {
                UserName = request.Email,
                Email = request.Email,
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                DNI = request.DNI,
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            var solicitaOperador = request.RolSolicitado == Roles.Operador;

            if (solicitaOperador)
            {
                user.EstadoAprobacion = EstadoAprobacion.Pendiente;
                user.Activo = false;
                await _userManager.UpdateAsync(user);
                await _userManager.AddToRoleAsync(user, Roles.Operador);

                return Ok(new { message = "Tu solicitud fue registrada. Un administrador revisará tu cuenta de operador antes de que puedas iniciar sesión." });
            }

            await _userManager.AddToRoleAsync(user, Roles.Ciudadano);

            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new LoginResponse
            {
                Id = user.Id,
                Nombres = user.Nombres,
                Apellidos = user.Apellidos,
                FullName = $"{user.Nombres} {user.Apellidos}",
                Email = user.Email ?? "",
                Role = Roles.Ciudadano,
                VerifiedEmail = user.EmailConfirmed,
                Message = "Registro exitoso"
            });
        }

        [HttpPost("send-password-reset")]
        public async Task<IActionResult> SendPasswordReset([FromBody] SendPasswordResetRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest(new { message = "El correo no está registrado" });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            await _emailService.SendAsync(
                request.Email,
                "Restablecer contraseña",
                $"<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><p><a href='{_generalSettings.Value.FrontendUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(request.Email)}'>Restablecer contraseña</a></p>"
            );

            return Ok(new { message = "Se ha enviado un correo para restablecer la contraseña" });
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new { message = "Las contraseñas no coinciden" });
            }
            
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            if (user == null)
                return BadRequest(new { message = "Solicitud inválida" });
            
            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new { message = "Contraseña restablecida exitosamente" });
        }

        [HttpPost("send-verification-email")]
        public async Task<IActionResult> SendVerifyEmail([FromBody] SendPasswordResetRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest(new { message = "El correo no está registrado" });
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            await _emailService.SendAsync(
                request.Email,
                "Verificar correo electrónico",
                $"<p>Para verificar tu correo electrónico, haz clic en el siguiente enlace:</p><p><a href='{_generalSettings.Value.FrontendUrl}/verify-email?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(request.Email)}'>Verificar correo electrónico</a></p>"
            );

            return Ok(new { message = "Se ha enviado un correo para verificar tu dirección de correo electrónico" });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Solicitud inválida" });
            }

            var result = await _userManager.ConfirmEmailAsync(user, request.Token);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Token inválido" });
            }

            return Ok(new { message = "Correo electrónico verificado exitosamente" });
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpGet("operadores/pendientes")]
        [ProducesResponseType<List<OperadorPendienteDto>>(StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarOperadoresPendientes()
        {
            var operadoresEnRol = await _userManager.GetUsersInRoleAsync(Roles.Operador);

            var pendientes = operadoresEnRol
                .Where(u => u.EstadoAprobacion == EstadoAprobacion.Pendiente)
                .OrderBy(u => u.FechaRegistro)
                .Select(u => new OperadorPendienteDto
                {
                    Id = u.Id,
                    Nombres = u.Nombres,
                    Apellidos = u.Apellidos,
                    Email = u.Email ?? "",
                    DNI = u.DNI,
                    FechaRegistro = u.FechaRegistro
                })
                .ToList();

            return Ok(pendientes);
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPost("operadores/{id}/aprobar")]
        public async Task<IActionResult> AprobarOperador(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Operador no encontrado" });

            if (!await _userManager.IsInRoleAsync(user, Roles.Operador))
                return BadRequest(new { message = "El usuario no tiene una solicitud de operador" });

            user.EstadoAprobacion = EstadoAprobacion.Aprobado;
            user.Activo = true;
            user.MotivoRechazo = null;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            return Ok(new { message = "Operador aprobado exitosamente" });
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPost("operadores/{id}/rechazar")]
        public async Task<IActionResult> RechazarOperador(string id, [FromBody] RechazarOperadorRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Operador no encontrado" });

            if (!await _userManager.IsInRoleAsync(user, Roles.Operador))
                return BadRequest(new { message = "El usuario no tiene una solicitud de operador" });

            user.EstadoAprobacion = EstadoAprobacion.Rechazado;
            user.Activo = false;
            user.MotivoRechazo = request.Motivo;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            return Ok(new { message = "Solicitud de operador rechazada" });
        }

        [Authorize]
        [HttpPut("datos-personales")]
        public async Task<IActionResult> EditDatosPersonales([FromBody] EditDatosPersonalesRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (userId == null)
                return Unauthorized(new { message = "Usuario no autenticado" });

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "Usuario no encontrado" });

            user.Nombres = request.Nombres;
            user.Apellidos = request.Apellidos;
            user.Email = request.Email;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            return Ok(new { message = "Datos personales actualizados exitosamente" });
        }

        [Authorize]
        [HttpPut("password")]
        public async Task<IActionResult> EditPassword([FromBody] EditPasswordRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (userId == null)
                return Unauthorized(new { message = "Usuario no autenticado" });
            
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "Usuario no encontrado" });

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            return Ok(new { message = "Contraseña actualizada exitosamente" });
        }

    }
}
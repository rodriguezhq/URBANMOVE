namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    public sealed class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class MeResponse
    {

        public required string Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public required bool VerifiedEmail { get; set; }
    }

    public class LoginResponse : MeResponse
    {
        public required string Message { get; set; }
    }

    public sealed class RegisterRequest
    {

        public required string Nombres { get; set; }
        public required string Apellidos { get; set; }
        public required string DNI { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }

    }

    public sealed class SendPasswordResetRequest
    {
        public required string Email { get; set; }
    }

    public sealed class ResetPasswordRequest
    {
        public required string Email { get; set; }
        public required string Token { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }
    public sealed class VerifyEmailRequest
    {
        public required string Email { get; set; }
        public required string Token { get; set; }
    }

}

namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    public sealed class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}

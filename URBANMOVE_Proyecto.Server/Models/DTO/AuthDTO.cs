namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    public sealed class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class MeResponse{

        public required string Id {get; set;}
        public required string FullName {get; set;}
        public required string Email {get; set;}
        public required string Role {get; set;}
    }

    public class LoginResponse : MeResponse
    {
        public required string Message { get; set; }
    }

    public sealed class RegisterRequest{

        public required string Name {get; set;}
        public required string LastName {get; set;}
        public required string Email {get; set;}
        public required string Password {get; set;}
        public required string ConfirmPassword {get; set;}
        
    }

}

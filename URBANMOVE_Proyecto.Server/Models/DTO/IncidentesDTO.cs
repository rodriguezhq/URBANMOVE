using Microsoft.AspNetCore.Http;
using URBANMOVE_Proyecto.Server.Models.Database;

namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    public sealed class CrearIncidenteRequest
    {
        public required string Descripcion { get; set; }
        public required CategoriaIncidente Categoria { get; set; }
        public required double Lat { get; set; }
        public required double Lng { get; set; }
        public IFormFile? Imagen { get; set; }
    }

    public sealed class ActualizarEstadoRequest
    {
        public required EstadoIncidente Estado { get; set; }
    }

    public sealed class IncidenteResponseDto
    {
        public int Id { get; set; }
        public string Descripcion { get; set; } = null!;
        public string? ImagenUrl { get; set; }
        public string Categoria { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public DateTime FechaRegistro { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string UsuarioId { get; set; } = null!;
        public string UsuarioNombre { get; set; } = null!;
    }
}
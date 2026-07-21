using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public sealed class Usuario : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public required string Nombres { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Apellidos { get; set; }

        [Required]
        [MaxLength(8)]
        public required string DNI { get; set; }

        [Required]
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        [Required]
        public bool Activo { get; set; } = true;

        [Required]
        public EstadoAprobacion EstadoAprobacion { get; set; } = EstadoAprobacion.Aprobado;

        [MaxLength(300)]
        public string? MotivoRechazo { get; set; }

        // Relaciones

        public ICollection<PuntosLedger> HistorialPuntos { get; set; } = [];
    }

    public enum EstadoAprobacion
    {
        Pendiente,
        Aprobado,
        Rechazado
    }

    public static class Roles
    {
        public const string Ciudadano = "ciudadano";
        public const string Operador = "operador";
        public const string Admin = "admin";

        public static readonly string[] All = [Ciudadano, Operador, Admin];

    }
}

using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public enum CategoriaIncidente
    {
        Accidente,
        Congestion,
        Vandalismo
    }

    public enum EstadoIncidente
    {
        Pendiente,
        EnRevision,
        Resuelto
    }

    public sealed class Incidente
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(300)]
        public required string descripcion { get; set; }

        [Required]
        public required Point Ubicacion { get; set; }

        [MaxLength(250)]
        public string? ImagenUrl { get; set; }

        [Required]
        public required CategoriaIncidente Categoria { get; set; }

        [Required]
        public required EstadoIncidente Estado { get; set; } = EstadoIncidente.Pendiente;

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Relaciones


        [ForeignKey(nameof(Usuario))]
        public required string UsuarioId { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Usuario Usuario { get; set; }

    }
}

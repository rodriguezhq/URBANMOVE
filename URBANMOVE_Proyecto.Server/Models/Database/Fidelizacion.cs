using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace URBANMOVE_Proyecto.Server.Models.Database
{

    [Index(nameof(Nombre), IsUnique = true)]
    public sealed class ComercioAliado
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = null!;

        [MaxLength(250)]
        public string Direccion { get; set; } = null!;

        public Point Ubicacion { get; set; } = null!;
    }

    public enum TipoMovimiento
    {
        Ganados,
        Canjeados,
    }

    public sealed class PuntosLedger
    {
        [Key]
        public long Id { get; set; }

        public int Cantidad { get; set; }
        public TipoMovimiento Tipo { get; set; }

        [MaxLength(300)]
        public string? Descripcion { get; set; }

        public DateTime Fecha { get; set; } = DateTime.UtcNow;


        // Relaciones


        [ForeignKey(nameof(Usuario))]
        public required string UsuarioId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Usuario Usuario { get; set; }


        [ForeignKey(nameof(Ticket))]
        public int? TicketId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public Ticket? Ticket { get; set; }


        [ForeignKey(nameof(Comercio))]
        public int? ComercioId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public ComercioAliado? Comercio{get; set;}
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public enum EstadoTicket
    {
        Reservado,
        Validado,
        Cancelado,
        Expirado
    }


    public sealed class Ticket
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public required string Codigo { get; set; }

        public DateTime FechaReserva { get; set; }

        public DateTime? FechaValidacion { get; set; }

        public EstadoTicket Estado { get; set; }

        // Relaciones

        [ForeignKey(nameof(Usuario))]
        public required string UsuarioId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public Usuario Usuario { get; set; } = null!;


        [ForeignKey(nameof(Salida))]
        public required int SalidaId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public SalidaProgramada Salida { get; set; } = null!;


        [ForeignKey(nameof(Unidad))]
        public required int UnidadId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public UnidadTransporte Unidad { get; set; } = null!;


        [ForeignKey(nameof(Operador))]
        public string? OperadorId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public Usuario? Operador { get; set; }

    }

}

using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        public required Usuario Usuario { get; set; }


        [ForeignKey(nameof(Salida))]
        public required int SalidaId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required SalidaProgramada Salida { get; set; }


        [ForeignKey(nameof(Unidad))]
        public required int UnidadId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required UnidadTransporte Unidad { get; set; }


        [ForeignKey(nameof(Operador))]
        public required string OperadorId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Usuario Operador { get; set; }

    }

}

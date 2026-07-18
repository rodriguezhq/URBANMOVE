using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    [Index(nameof(Nombre), IsUnique = true)]
    public sealed class Linea
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public required string Nombre { get; set; }

        // Relaciones
        public ICollection<Ruta> Rutas { get; set; } = [];
    }


    [Index(nameof(Nombre), IsUnique = true)]
    public sealed class Ruta
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public required string Nombre { get; set; }

        [Required]
        public required LineString Recorrido { get; set; }


        // Relaciones

        [ForeignKey(nameof(Linea))]
        public int LineaId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Linea Linea { get; set; }


        public ICollection<RutaParada> RutaParadas { get; set; } = [];
        public ICollection<SalidaProgramada> Salidas { get; set; } = [];
    }


    [PrimaryKey(nameof(RutaId), nameof(ParadaId))]
    public sealed class RutaParada
    {
        public int Orden { get; set; }

        public int TiempoDescansoSegundos { get; set; } = 30;

        // Relaciones

        [Required, ForeignKey(nameof(Ruta))]
        public required int RutaId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Ruta Ruta { get; set; }


        [Required, ForeignKey(nameof(Parada))]
        public required int ParadaId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Parada Parada { get; set; }

    }


    [Index(nameof(Nombre), IsUnique = true)]
    public sealed class Parada
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public required string Nombre { get; set; }

        [Required]
        public required Point Ubicacion { get; set; }

        // Relaciones

        public ICollection<RutaParada> RutaParadas { get; set; } = [];

    }


    public enum EstadioSalida
    {
        Programada,
        EnCurso,
        Finalizada,
        Cancelada
    }

    public enum TipoProgramacion
    {
        Unica,
        Diaria,
        Semanal,
        Mensual,
    }

    public sealed class SalidaProgramada
    {
        [Key]
        public int Id { get; set; }

        public DateTime FechaHoraSalida { get; set; }
        public DateTime FechaHoraLlegadaEstimada { get; set; }

        public EstadioSalida Estado { get; set; } = EstadioSalida.Programada;

        public TipoProgramacion TipoProgramacion { get; set; } = TipoProgramacion.Unica;

        public DayOfWeek? DiaSemana { get; set; }

        public DateOnly? FechaFinRecurrencia { get; set; }


        // Relaciones

        [ForeignKey(nameof(Ruta))]
        public int RutaId { get; set; }
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public required Ruta Ruta { get; set; }


        [ForeignKey(nameof(UnidadTransporte))]
        public int UnidadTransporteId { get; set; }
        public required UnidadTransporte UnidadTransporte { get; set; }
    }


    [Index(nameof(Placa), IsUnique = true)]
    public sealed class UnidadTransporte
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public required string Placa { get; set; }

        public int Capacidad { get; set; } = 0;

        public bool Activa { get; set; } = true;

        public decimal VelocidadPromedioKmH { get; set; } = 0;


        // Relaciones


        public ICollection<SalidaProgramada> Salidas { get; set; } = [];

    }

}

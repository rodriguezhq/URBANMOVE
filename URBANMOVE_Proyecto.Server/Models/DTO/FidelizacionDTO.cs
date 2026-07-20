using URBANMOVE_Proyecto.Server.Models.Database;

namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    // ── Comercios aliados ───────────────────────────────────────────────────────

    public sealed class ComercioResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    public sealed class CrearComercioRequest
    {
        public required string Nombre { get; set; }
        public required string Direccion { get; set; }
        public required double Lat { get; set; }
        public required double Lng { get; set; }
    }

    public sealed class ActualizarComercioRequest
    {
        public required string Nombre { get; set; }
        public required string Direccion { get; set; }
        public required double Lat { get; set; }
        public required double Lng { get; set; }
    }

    // ── Puntos ──────────────────────────────────────────────────────────────────

    public sealed class MovimientoPuntosDto
    {
        public long Id { get; set; }
        public int Cantidad { get; set; }
        public string Tipo { get; set; } = null!;
        public string? Descripcion { get; set; }
        public DateTime Fecha { get; set; }
    }

    public sealed class SaldoPuntosResponseDto
    {
        public int SaldoActual { get; set; }
        public List<MovimientoPuntosDto> Movimientos { get; set; } = [];
    }

    public sealed class CanjearPuntosRequest
    {
        public required int ComercioId { get; set; }
    }

    public sealed class CanjearPuntosResponseDto
    {
        public int SaldoRestante { get; set; }
        public int PuntosCanjeados { get; set; }
        public decimal DescuentoSoles { get; set; }
        public string Comercio { get; set; } = null!;
    }
}
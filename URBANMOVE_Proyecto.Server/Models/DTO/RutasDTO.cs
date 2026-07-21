using NetTopologySuite.Geometries;

namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    public sealed class WaypointDto
    {
        public required double Lat { get; set; }
        public required double Lng { get; set; }
    }

    public sealed class CalculateRuteRequest
    {
        public required List<WaypointDto> Coordinates { get; set; } = [];
        public CancellationToken CancellationToken { get; set; } = default;
    }
    public sealed class CrearRutaRequest
    {
        public required string Nombre { get; set; }
        public int LineaId { get; set; }

        public required string GeoJsonRecorrido { get; set; }

        public required List<int> ParadasIds { get; set; }

    }
}
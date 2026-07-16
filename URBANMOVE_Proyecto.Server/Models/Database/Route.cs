using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries;

public class Route
{
    [Key]
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string LineCode { get; set; }
    public required LineString Geometry { get; set; }
    public bool Active { get; set; }

    // relaciones
    public virtual ICollection<RouteStop>? RouteStops { get; set; }
}
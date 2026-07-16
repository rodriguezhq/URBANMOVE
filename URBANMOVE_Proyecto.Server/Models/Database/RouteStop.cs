using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

public class RouteStop
{
    [Key] public int Id { get; set; }
    
    public required string Name { get; set; }
    public required  Point Location { get; set; }
    public int Order { get; set; }

    // Relaciones
    [ForeignKey(name: nameof(Route))]
    public int RouteId { get; set; }
    public required virtual Route Route { get; set; }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

public class Vehicle
{
    [Key]
    public int Id { get; set; }


    public required string Name { get; set; }

    public required Point Location { get; set; }

    public int Order { get; set; }

    [ForeignKey(name: nameof(Route))]
    public int? RouteId { get; set; }
    public virtual Route? Route { get; set; }
}
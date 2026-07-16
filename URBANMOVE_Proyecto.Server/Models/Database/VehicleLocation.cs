using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

public class VehicleLocation
{
    [Key]
    public int Id { get; set; }


    public required Point Position { get; set; }

    public DateTime Timestamp { get; set; }

    [ForeignKey(name: nameof(Vehicle))]
    public int VehicleId { get; set; }
    public required virtual Vehicle Vehicle { get; set; }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Schedule
{
    [Key]
    public int Id { get; set; }

    public TimeOnly DepartureTime { get; set; }
    public int FrequencyMinutes { get; set; }

    [ForeignKey(name: nameof(Route))]
    public int RouteId { get; set; }
    public virtual required Route Route { get; set; }

    [ForeignKey(name: nameof(Vehicle))]
    public int VehicleId { get; set; }
    public virtual Vehicle? Vehicle { get; set; }
}
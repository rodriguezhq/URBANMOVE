using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;
using URBANMOVE_Proyecto.Server.Models.Database;

public class IncidentReport
{
    [Key]
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public IncidentCategory Category { get; set; }

    public IncidentStatus Status { get; set; }

    public required Point Location { get; set; }

    public DateTime CreatedAt { get; set; }

    // Relaciones
    [ForeignKey(name: nameof(User))]
    public required string UserId { get; set; }
    public virtual required ApplicationUser User { get; set; }

    public required virtual ICollection<IncidentImage> Images { get; set; }
}

public enum IncidentCategory
{
    RoadDamage,
    TrafficAccident,
    Other
}

public enum IncidentStatus
{
    Pending,
    InProgress,
    Resolved
}
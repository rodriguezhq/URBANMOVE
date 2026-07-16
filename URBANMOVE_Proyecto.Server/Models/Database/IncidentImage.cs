using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class IncidentImage
{
    [Key]
    public int Id { get; set; }
    public string? Url { get; set; }

    [ForeignKey(name: nameof(Incident))]
    public int IncidentId { get; set; }
    public virtual required IncidentReport Incident { get; set; }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using URBANMOVE_Proyecto.Server.Models.Database;

public class Ticket
{
    [Key]
    public int Id { get; set; }

    public string TicketCode { get; set; } = Guid.NewGuid().ToString();

    public TicketStatus Status { get; set; } = TicketStatus.Reserved;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UsedAt { get; set; }

    [ForeignKey(nameof(User))]
    public int UserId { get; set; }
    public required virtual ApplicationUser User { get; set; }

    [ForeignKey(nameof(Schedule))]
    public int ScheduleId { get; set; }
    public required virtual Schedule Schedule { get; set; }
}

public enum TicketStatus
{
    Reserved,
    Validated,
    Cancelled,
    Expired
}
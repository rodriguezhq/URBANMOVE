using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using URBANMOVE_Proyecto.Server.Models.Database;

public class TicketValidation
{
    [Key]
    public int Id { get; set; }

    public DateTime ValidationTime { get; set; } = DateTime.UtcNow;

    [ForeignKey(name: nameof(Operator))]
    public int OperatorId { get; set; }
    public required virtual ApplicationUser Operator { get; set; }

    [ForeignKey(name: nameof(Ticket))]
    public int TicketId { get; set; }
    public required virtual Ticket Ticket { get; set; }
}
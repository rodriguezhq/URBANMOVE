using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using URBANMOVE_Proyecto.Server.Models.Database;

public class EcoPointsAccount
{
    [Key]
    public int Id { get; set; }


    public int CurrentPoints { get; set; }

    [ForeignKey(name: nameof(User))]
    public required string UserId { get; set; }
    public virtual required ApplicationUser User { get; set; }
}
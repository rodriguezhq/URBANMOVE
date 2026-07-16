using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class EcoTransaction
{
    [Key]
    public int Id { get; set; }


    public int Points { get; set; }

    public EcoTransactionType Type { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey(name: nameof(Account))]
    public required int AccountId { get; set; }
    public virtual required EcoPointsAccount Account { get; set; }
}

public enum EcoTransactionType
{
    Earned,
    Redeemed
}
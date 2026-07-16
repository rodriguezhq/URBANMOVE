using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public class ApplicationUser : IdentityUser
    {
        public required string Name { get; set; }
        public required string LastName { get; set; }

        public bool IsApproved { get; set; }

        public DateTime CreatedAt { get; set; }

        public virtual ICollection<IncidentReport>? Reports { get; set; }
    }
}

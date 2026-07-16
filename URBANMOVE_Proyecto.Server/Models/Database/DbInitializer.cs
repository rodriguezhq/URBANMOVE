using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext db, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            // migraciones pendientes
            await db.Database.MigrateAsync();

            // Usuarios por defecto
            if (await db.Users.AnyAsync())
                return;
            
            foreach (var roleName in Roles.All)
            {
                if (!await db.Roles.AnyAsync(r => r.Name == roleName))
                {
                    var role = new IdentityRole
                    {
                        Name = roleName,
                        NormalizedName = roleName.ToUpper()
                    };
                    db.Roles.Add(role);
                }
            }

            var adminUser = new ApplicationUser
            {
                UserName = "admin",
                Name = "admin",
                LastName = "User",
                Email = "admin@admin.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                CreatedAt = DateTime.UtcNow,
            };
            
            var result = await userManager.CreateAsync(adminUser, "admin123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.Admin);
            }
        }
    }
}

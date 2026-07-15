using Microsoft.EntityFrameworkCore;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext db)
        {
            // migraciones pendientes
            await db.Database.MigrateAsync();

            // Usuarios por defecto
            if (await db.Users.AnyAsync())
                return;
            var defaultUser = new User
            {
                FullName = "Admin",
                Email = "admin@urbanmove.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(defaultUser);
            await db.SaveChangesAsync();
        }
    }
}

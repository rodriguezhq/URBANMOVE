using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext db, RoleManager<IdentityRole> roleManager, UserManager<Usuario> userManager)
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

            var adminUser = new Usuario
            {
                UserName = "admin",
                Nombres = "admin",
                Apellidos = "User",
                DNI = "00000000",
                Email = "admin@admin.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Activo = true,
            };

            var ciudadanoUser = new Usuario
            {
                UserName = "ciudadano",
                Nombres = "ciudadano",
                Apellidos = "User",
                DNI = "11111111",
                Email = "ciudadano@ciudadano.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("ciudadano123"),
                Activo = true,
            };

            var operadorUser = new Usuario
            {
                UserName = "operador",
                Nombres = "operador",
                Apellidos = "User",
                DNI = "22222222",
                Email = "operador@operador.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("operador123"),
                Activo = true,
            };

            var result = await userManager.CreateAsync(adminUser, "admin123");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.Admin);
            }

            result = await userManager.CreateAsync(ciudadanoUser, "ciudadano123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(ciudadanoUser, Roles.Ciudadano);
            }

            result = await userManager.CreateAsync(operadorUser, "operador123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(operadorUser, Roles.Operador);
            }
        }
    }
}

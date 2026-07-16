using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<EcoPointsAccount> EcoPointsAccounts => Set<EcoPointsAccount>();
        public DbSet<EcoTransaction> EcoTransactions => Set<EcoTransaction>();
        public DbSet<IncidentImage> IncidentImages => Set<IncidentImage>();
        public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
        public DbSet<Route> Routes => Set<Route>();
        public DbSet<RouteStop> RouteStops => Set<RouteStop>();
        public DbSet<Schedule> Schedules => Set<Schedule>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        public DbSet<VehicleLocation> VehicleLocations => Set<VehicleLocation>();

    }
}

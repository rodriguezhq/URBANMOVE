using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace URBANMOVE_Proyecto.Server.Models.Database
{
    public class AppDbContext : IdentityDbContext<Usuario>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        //public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<Linea> Lineas => Set<Linea>();
        public DbSet<Ruta> Rutas => Set<Ruta>();
        public DbSet<RutaParada> RutaParadas => Set<RutaParada>();
        public DbSet<Parada> Paradas => Set<Parada>();
        public DbSet<SalidaProgramada> SalidasProgramadas => Set<SalidaProgramada>();
        public DbSet<UnidadTransporte> UnidadesTransporte => Set<UnidadTransporte>();
        public DbSet<Incidente> Incidentes => Set<Incidente>();
        public DbSet<ComercioAliado> ComercioAliado => Set<ComercioAliado>();
        public DbSet<PuntosLedger> PuntosLedgers => Set<PuntosLedger>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Parada>().Property(p => p.Ubicacion).HasSrid(4326);
            builder.Entity<Ruta>().Property(r => r.Recorrido).HasSrid(4326);
            builder.Entity<ComercioAliado>().Property(c => c.Ubicacion).HasSrid(4326);
        }
    }
}

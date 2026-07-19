using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using URBANMOVE_Proyecto.Server.Models.Database;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Services
{
    public class IncidentesService
    {
        private static readonly string[] ExtensionesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];
        private const long TamanioMaximoBytes = 5 * 1024 * 1024;

        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public IncidentesService(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        public async Task<IncidenteResponseDto> CrearAsync(string usuarioId, CrearIncidenteRequest req)
        {
            var usuario = await _db.Users.FindAsync(usuarioId)
                ?? throw new InvalidOperationException("Usuario no encontrado.");

            string? imagenUrl = null;
            if (req.Imagen is not null)
                imagenUrl = await GuardarImagenAsync(req.Imagen);

            var gf = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 0);
            var punto = gf.CreatePoint(new Coordinate(req.Lng, req.Lat));

            var incidente = new Incidente
            {
                descripcion = req.Descripcion,
                Ubicacion = punto,
                ImagenUrl = imagenUrl,
                Categoria = req.Categoria,
                Estado = EstadoIncidente.Pendiente,
                UsuarioId = usuarioId,
                Usuario = usuario,
            };

            _db.Incidentes.Add(incidente);
            await _db.SaveChangesAsync();

            return MapToDto(incidente, usuario);
        }

        public async Task<List<IncidenteResponseDto>> ListarAsync(
            string usuarioId, string rol, CategoriaIncidente? categoria, EstadoIncidente? estado)
        {
            var q = _db.Incidentes.Include(i => i.Usuario).AsQueryable();

            if (rol == Roles.Ciudadano)
                q = q.Where(i => i.UsuarioId == usuarioId);

            if (categoria.HasValue)
                q = q.Where(i => i.Categoria == categoria.Value);

            if (estado.HasValue)
                q = q.Where(i => i.Estado == estado.Value);

            var lista = await q.OrderByDescending(i => i.FechaRegistro).ToListAsync();
            return lista.Select(i => MapToDto(i, i.Usuario)).ToList();
        }

        public async Task<IncidenteResponseDto?> ObtenerDetalleAsync(int id, string usuarioId, string rol)
        {
            var incidente = await _db.Incidentes
                .Include(i => i.Usuario)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (incidente is null) return null;
            if (rol == Roles.Ciudadano && incidente.UsuarioId != usuarioId) return null;

            return MapToDto(incidente, incidente.Usuario);
        }

        public async Task<bool> ActualizarEstadoAsync(int id, EstadoIncidente nuevoEstado)
        {
            var incidente = await _db.Incidentes.FindAsync(id);
            if (incidente is null) return false;

            incidente.Estado = nuevoEstado;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarAsync(int id)
        {
            var incidente = await _db.Incidentes.FindAsync(id);
            if (incidente is null) return false;

            if (!string.IsNullOrEmpty(incidente.ImagenUrl))
                EliminarImagenDelDisco(incidente.ImagenUrl);

            _db.Incidentes.Remove(incidente);
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task<string> GuardarImagenAsync(IFormFile imagen)
        {
            var ext = Path.GetExtension(imagen.FileName).ToLowerInvariant();
            if (!ExtensionesPermitidas.Contains(ext))
                throw new InvalidOperationException("Formato de imagen no permitido solo usa JPG, PNG o WEBP.");

            if (imagen.Length > TamanioMaximoBytes)
                throw new InvalidOperationException("La imagen supera el tamaño máximo permitido es de 5MB.");

            var carpeta = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "incidentes");
            Directory.CreateDirectory(carpeta);

            var nombreArchivo = $"{Guid.NewGuid()}{ext}";
            var rutaCompleta = Path.Combine(carpeta, nombreArchivo);

            await using var stream = new FileStream(rutaCompleta, FileMode.Create);
            await imagen.CopyToAsync(stream);

            return $"/api/uploads/incidentes/{nombreArchivo}";
        }

        private void EliminarImagenDelDisco(string imagenUrl)
        {
            var nombreArchivo = Path.GetFileName(imagenUrl);
            var ruta = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "incidentes", nombreArchivo);
            if (File.Exists(ruta))
                File.Delete(ruta);
        }

        private static IncidenteResponseDto MapToDto(Incidente i, Usuario usuario) => new()
        {
            Id = i.Id,
            Descripcion = i.descripcion,
            ImagenUrl = i.ImagenUrl,
            Categoria = i.Categoria.ToString(),
            Estado = i.Estado.ToString(),
            FechaRegistro = i.FechaRegistro,
            Lat = i.Ubicacion.Y,
            Lng = i.Ubicacion.X,
            UsuarioId = i.UsuarioId,
            UsuarioNombre = $"{usuario.Nombres} {usuario.Apellidos}",
        };
    }
}
namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    // ──────────────────────────────────────────
    // REQUEST
    // ──────────────────────────────────────────

    /// <summary>
    /// Filtros de búsqueda de rutas para el ciudadano (RF-02).
    /// Todos los campos son opcionales: si no se envían, se retornan todas las rutas.
    /// </summary>
    public sealed class BusquedaRutasRequest
    {
        /// <summary>Parada de origen (Id). Filtra rutas que pasen por esta parada.</summary>
        public int? OrigenParadaId { get; set; }

        /// <summary>Parada de destino (Id). Filtra rutas que pasen por esta parada.</summary>
        public int? DestinoParadaId { get; set; }

        /// <summary>Id de línea para filtrar solo las rutas de esa línea.</summary>
        public int? LineaId { get; set; }

        /// <summary>Límite inferior de fecha/hora de salida (UTC).</summary>
        public DateTime? FechaHoraDesde { get; set; }

        /// <summary>Límite superior de fecha/hora de salida (UTC).</summary>
        public DateTime? FechaHoraHasta { get; set; }

        /// <summary>Si es true, solo retorna salidas con al menos 1 asiento disponible.</summary>
        public bool SoloConAsientos { get; set; } = false;

        public int Pagina { get; set; } = 1;
        public int TamanioPagina { get; set; } = 10;
    }

    // ──────────────────────────────────────────
    // RESPONSE – piezas
    // ──────────────────────────────────────────

    public sealed class ParadaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    public sealed class LineaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
    }

    public sealed class SalidaDto
    {
        public int Id { get; set; }
        public DateTime FechaHoraSalida { get; set; }
        public DateTime FechaHoraLlegadaEstimada { get; set; }

        /// <summary>Estado textual: Programada | EnCurso | Finalizada | Cancelada</summary>
        public string Estado { get; set; } = null!;

        public string PlacaUnidad { get; set; } = null!;
        public int CapacidadTotal { get; set; }
        public int AsientosOcupados { get; set; }
        public int AsientosDisponibles { get; set; }
    }

    public sealed class RutaParadaDto
    {
        public int Orden { get; set; }
        public ParadaDto Parada { get; set; } = null!;
    }

    public sealed class RutaResumenDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public LineaDto Linea { get; set; } = null!;

        /// <summary>Paradas de la ruta ordenadas por campo Orden.</summary>
        public List<RutaParadaDto> Paradas { get; set; } = [];

        /// <summary>Salidas que coinciden con los filtros aplicados.</summary>
        public List<SalidaDto> Salidas { get; set; } = [];
    }

    // ──────────────────────────────────────────
    // RESPONSE – paginado
    // ──────────────────────────────────────────

    public sealed class ResultadoPaginadoDto<T>
    {
        public int PaginaActual { get; set; }
        public int TamanioPagina { get; set; }
        public int TotalRegistros { get; set; }
        public int TotalPaginas { get; set; }
        public List<T> Datos { get; set; } = [];
    }
}

namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    // ──────────────────────────────────────────
    // RESPONSE – dashboard del operador (RF-04)
    // ──────────────────────────────────────────

    /// <summary>
    /// KPIs numéricos que se muestran como tarjetas de resumen en la parte
    /// superior del dashboard.
    /// </summary>
    public sealed class DashboardKpisDto
    {
        public int UnidadesActivas { get; set; }
        public int UnidadesTotal { get; set; }

        /// <summary>Salidas con estado EnCurso en este momento.</summary>
        public int SalidasEnCurso { get; set; }

        /// <summary>Salidas programadas en los próximos 7 días.</summary>
        public int SalidasProximas { get; set; }

        public int IncidentesPendientes { get; set; }

        /// <summary>Porcentaje promedio de ocupación de las próximas salidas (0-100).</summary>
        public int OcupacionPromedio { get; set; }
    }

    /// <summary>Estado actual de una unidad de transporte para la tabla de unidades.</summary>
    public sealed class UnidadEstadoDto
    {
        public int Id { get; set; }
        public string Placa { get; set; } = null!;
        public int Capacidad { get; set; }
        public bool Activa { get; set; }
        public decimal VelocidadPromedioKmH { get; set; }

        /// <summary>Descripción de la salida en curso, o null si está libre.</summary>
        public string? SalidaActual { get; set; }
    }

    /// <summary>Una salida programada para la tabla de programación de frecuencias.</summary>
    public sealed class FrecuenciaDto
    {
        public int SalidaId { get; set; }
        public string Ruta { get; set; } = null!;
        public string Linea { get; set; } = null!;
        public string PlacaUnidad { get; set; } = null!;
        public DateTime FechaHoraSalida { get; set; }
        public DateTime FechaHoraLlegadaEstimada { get; set; }

        /// <summary>Estado textual: Programada | EnCurso | Finalizada | Cancelada</summary>
        public string Estado { get; set; } = null!;

        public int AsientosOcupados { get; set; }
        public int CapacidadTotal { get; set; }
    }

    /// <summary>Alerta de desviación (retraso) o incidente para el panel de alertas.</summary>
    public sealed class AlertaDto
    {
        /// <summary>Tipo de alerta: Retraso | Incidente</summary>
        public string Tipo { get; set; } = null!;
        public string Mensaje { get; set; } = null!;
        public DateTime Fecha { get; set; }
    }

    /// <summary>Punto simple (parada) para dibujar en el mapa interactivo.</summary>
    public sealed class PuntoMapaDto
    {
        public string Nombre { get; set; } = null!;
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    /// <summary>Incidente geolocalizado para dibujar en el mapa interactivo.</summary>
    public sealed class IncidenteMapaDto
    {
        public int Id { get; set; }
        public string Descripcion { get; set; } = null!;
        public string Categoria { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public double Lat { get; set; }
        public double Lng { get; set; }
        public DateTime FechaRegistro { get; set; }
    }

    /// <summary>Datos geográficos que alimentan el mapa interactivo del dashboard.</summary>
    public sealed class DashboardMapaDto
    {
        public List<PuntoMapaDto> Paradas { get; set; } = [];
        public List<IncidenteMapaDto> Incidentes { get; set; } = [];
    }

    /// <summary>Respuesta completa del dashboard del operador (RF-04).</summary>
    public sealed class DashboardResumenDto
    {
        public DashboardKpisDto Kpis { get; set; } = new();
        public List<UnidadEstadoDto> Unidades { get; set; } = [];
        public List<FrecuenciaDto> Frecuencias { get; set; } = [];
        public List<AlertaDto> Alertas { get; set; } = [];
        public DashboardMapaDto Mapa { get; set; } = new();
    }
}

namespace URBANMOVE_Proyecto.Server.Models.DTO
{
    public class TicketResumenDTO
    {
        public int Id { get; set; }
        public required string Codigo { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaReserva { get; set; }
        public DateTime FechaHoraSalida { get; set; }
        public string RutaNombre { get; set; } = string.Empty;
        public string PlacaUnidad { get; set; } = string.Empty;
    }

    public sealed class TicketExportDto
    {
        public int Id { get; set; }
        public required string Codigo { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaReserva { get; set; }
        public DateTime FechaHoraSalida { get; set; }
        public string RutaNombre { get; set; } = string.Empty;
        public string PlacaUnidad { get; set; } = string.Empty;
        public string UsuarioNombre { get; set; } = string.Empty;
    }
}
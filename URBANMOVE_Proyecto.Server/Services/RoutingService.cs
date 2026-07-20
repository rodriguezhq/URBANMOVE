using System.Text.Json.Serialization;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using URBANMOVE_Proyecto.Server.Models.DTO;

namespace URBANMOVE_Proyecto.Server.Services
{
    public sealed class RouteResult
    {
        public required LineString Geometry { get; init; }
        public double DistanceMeters { get; init; }
        public double DurationSeconds { get; init; }
    }

    public class RoutingService
    {
        private readonly HttpClient _httpClient;
        private readonly GeometryFactory _geometryFactory;

        public RoutingService(HttpClient httpClient)
        {
            _httpClient = httpClient;

            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<RouteResult> CalculateRouteAsync(
            IReadOnlyList<WaypointDto> waypoints,
            CancellationToken cancellationToken = default
        )
        {
            if (waypoints.Count < 2)
            {
                throw new ArgumentException("At least two waypoints are required to calculate a route.");
            }

            var coordinates = string.Join(
                ";",
                waypoints.Select(p => $"{p.Lng},{p.Lat}"));


            var url =
            $"route/v1/driving/{coordinates}" +
            "?overview=full" +
            "&geometries=geojson";

            var response = await _httpClient.GetFromJsonAsync<OsrmResponse>(url, cancellationToken);

            if (response is null || response.Routes.Count == 0)
                throw new InvalidOperationException("OSRM no devolvió rutas.");

            var route = response.Routes[0];

            var lineString = _geometryFactory.CreateLineString(
                route.Geometry.Coordinates
                    .Select(c => new Coordinate(c[0], c[1]))
                    .ToArray());

            return new RouteResult
            {
                Geometry = lineString,
                DistanceMeters = route.Distance,
                DurationSeconds = route.Duration
            };

        }

    }

    public class OsrmResponse
    {
        [JsonPropertyName("routes")]
        public List<OsrmRoute> Routes { get; set; } = [];
    }

    public class OsrmRoute
    {
        [JsonPropertyName("distance")]
        public double Distance { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }

        [JsonPropertyName("geometry")]
        public GeoJsonGeometry Geometry { get; set; } = default!;
    }

    public class GeoJsonGeometry
    {
        [JsonPropertyName("coordinates")]
        public List<List<double>> Coordinates { get; set; } = [];
    }

}
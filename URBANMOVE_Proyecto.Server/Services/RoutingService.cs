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

            try
            {
                return await TryCalculateFromOsrm(waypoints, cancellationToken);
            }
            catch
            {
                return CalculateDirectLine(waypoints);
            }
        }

        private async Task<RouteResult> TryCalculateFromOsrm(
            IReadOnlyList<WaypointDto> waypoints,
            CancellationToken cancellationToken)
        {
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

        private RouteResult CalculateDirectLine(IReadOnlyList<WaypointDto> waypoints)
        {
            var coordinates = waypoints
                .Select(p => new Coordinate(p.Lng, p.Lat))
                .ToArray();

            var lineString = _geometryFactory.CreateLineString(coordinates);

            var distanceMeters = 0.0;
            for (int i = 1; i < coordinates.Length; i++)
            {
                distanceMeters += DistanceInMeters(
                    coordinates[i - 1].Y, coordinates[i - 1].X,
                    coordinates[i].Y, coordinates[i].X);
            }

            var durationSeconds = distanceMeters / 8.33; // ~30 km/h promedio

            return new RouteResult
            {
                Geometry = lineString,
                DistanceMeters = Math.Round(distanceMeters, 2),
                DurationSeconds = Math.Round(durationSeconds, 2)
            };
        }

        private static double DistanceInMeters(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371000.0;
            var dLat = (lat2 - lat1) * Math.PI / 180.0;
            var dLon = (lon2 - lon1) * Math.PI / 180.0;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
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
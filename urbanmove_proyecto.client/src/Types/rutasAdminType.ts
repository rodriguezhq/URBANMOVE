export interface WaypointDto {
    lat: number;
    lng: number;
}
export interface CalculateRuteRequest {
    coordinates: WaypointDto[]
}
export interface CrearRutaRequest {
    nombre: string;
    lineaId: number;
    geoJsonRecorrido: string;
    paradasIds: number[];
}
export interface CalculateRuteResponse {
    geometry: string;
    distanceMeters: number;
    durationSeconds: number;
}
export interface GuardarRutaResponse {
    mensaje: string,
    rutaId: number,
}
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
export interface LineaCrearRequest {
    nombre: string;
}
export interface ParadaCrearRequest {
    nombre: string;
    lat: number;
    lng: number;
}
export interface RutaListItem {
    id: number;
    nombre: string;
    lineaNombre: string;
    cantidadParadas: number;
}
export interface MensajeResponse {
    mensaje: string;
}
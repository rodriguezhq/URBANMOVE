import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { DashboardMapa } from '../../Types/dashboardTypes';
import EstadoBadge from '../IncidentesComponents/EstadoBadge';

interface MapaDashboardProps {
    mapa: DashboardMapa;
}

// Centro por defecto: Huancayo, Perú (coincide con las paradas sembradas).
const CENTRO_HUANCAYO: [number, number] = [-12.065, -75.205];

// Color del incidente según su estado.
const COLOR_INCIDENTE: Record<string, string> = {
    Pendiente: '#dc2626',   // rojo
    EnRevision: '#2563eb',  // azul
    Resuelto: '#16a34a',    // verde
};

/**
 * Mapa interactivo (OpenStreetMap) que muestra las paradas de la red y los
 * incidentes geolocalizados. Usa CircleMarker para no depender de assets de
 * iconos de Leaflet.
 */
export default function MapaDashboard({ mapa }: MapaDashboardProps) {
    return (
        <section className="flex flex-col overflow-hidden border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-violet-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950">
                        Mapa de la red
                    </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-3 w-3 rounded-full bg-violet-600" /> Paradas
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-3 w-3 rounded-full bg-red-600" /> Incidentes
                    </span>
                </div>
            </header>

            <MapContainer
                center={CENTRO_HUANCAYO}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '420px', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Paradas */}
                {mapa.paradas.map((p, i) => (
                    <CircleMarker
                        key={`parada-${i}`}
                        center={[p.lat, p.lng]}
                        radius={7}
                        pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.8 }}
                    >
                        <Popup>
                            <strong>Parada:</strong> {p.nombre}
                        </Popup>
                    </CircleMarker>
                ))}

                {/* Incidentes */}
                {mapa.incidentes.map(inc => {
                    const color = COLOR_INCIDENTE[inc.estado] ?? '#dc2626';
                    return (
                        <CircleMarker
                            key={`incidente-${inc.id}`}
                            center={[inc.lat, inc.lng]}
                            radius={9}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
                        >
                            <Popup>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <strong>{inc.categoria}</strong>
                                        <EstadoBadge estado={inc.estado} />
                                    </div>
                                    <span>{inc.descripcion}</span>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </section>
    );
}

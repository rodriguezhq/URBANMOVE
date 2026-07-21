import { useEffect, useState } from "react";
import type { LineaDto, ParadaDto } from "../Types/navegacionTypes";
import { NavegacionService } from "../services/NavegacionService";
import { RutasAdminService } from "../services/RutasAdminService";
import { MapIcon, Navigation, Save, X } from "lucide-react";
import AppButton from "../Components/AppButton";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

export default function GestionRutasView() {
    const [lineas, setLineas] = useState<LineaDto[]>([]);
    const [paradasTotales, setParadasTotales] = useState<ParadaDto[]>([]);

    const [nombreRuta, setNombreRuta] = useState('');
    const [lineaId, setLineaId] = useState<number | ''>('');
    const [paradasSeleccionadas, setParadasSeleccionadas] = useState<ParadaDto[]>([]);

    const [trazoCalculadoGeoJson, setTrazoCalculadoGeoJson] = useState<string | null>(null);
    const [trazoDibujo, setTrazoDibujo] = useState<[number, number][]>([]);

    useEffect(() => {
        NavegacionService.obtenerLineas().then(setLineas);
        NavegacionService.buscarParadas().then(setParadasTotales);
    }, []);
    const toggleParada = (parada: ParadaDto) => {
        if (paradasSeleccionadas.some(p => p.id === parada.id)) {
            setParadasSeleccionadas(prev => prev.filter(p => p.id !== parada.id));
        } else {
            setParadasSeleccionadas(prev => [...prev, parada]);
        }
        // limpiar si el trazo se cambia 
        setTrazoCalculadoGeoJson(null);
        setTrazoDibujo([]);
    }
    const handleCalcular = async () => {
        if (paradasSeleccionadas.length < 2) return alert("Selecciona al menos 2 paradas en el mapa.")
        try {
            const req = { coordinates: paradasSeleccionadas.map(p => ({ lat: p.lat, lng: p.lng })) };
            const res = await RutasAdminService.calcularTrazo(req);
            setTrazoCalculadoGeoJson(res.geometry);

            //decodificar geojson simple para dibujar en el Leaflet
            const geo = JSON.parse(res.geometry);
            if (geo.type === "LineString") {
                const coordenadas = geo.coordinates.map((c: any) => [c[1], c[0]] as [number, number]); // GeoJson es [lng, lat]
                setTrazoDibujo(coordenadas);
            }
        } catch (error) {
            alert('Error al calcular el trazo: ' + error);
        }
    }
    const handleGuardar = async () => {
        if (!nombreRuta || !lineaId || !trazoCalculadoGeoJson) return alert("Faltan datos o calcular el trazo.");
        try {
            await RutasAdminService.guardarRuta({
                nombre: nombreRuta,
                lineaId: Number(lineaId),
                geoJsonRecorrido: trazoCalculadoGeoJson,
                paradasIds: paradasSeleccionadas.map(p => p.id)
            });
            alert("¡Ruta guardada exitosamente!");
            // Reiniciar
            setNombreRuta('');
            setParadasSeleccionadas([]);
            setTrazoCalculadoGeoJson(null);
            setTrazoDibujo([]);
        } catch (error) {
            alert("Error al guardar la ruta." + error);
        }
    };
    return (
        <div className="flex h-[calc(100vh-60px)]">
            {/* Panel Izquierdo */}
            <div className="w-[35%] bg-white p-6 shadow-lg z-10 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-blue-950">
                        <MapIcon className="text-violet-600" /> Creador de Rutas
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Haz clic en los paraderos del mapa para unirlos en orden.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                        Línea a la que pertenece
                        <select value={lineaId} onChange={e => setLineaId(Number(e.target.value))} className="border p-2 rounded">
                            <option value="">-- Selecciona Línea --</option>
                            {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                        Nombre de la Ruta (ej. "Centro - Tambo")
                        <input type="text" value={nombreRuta} onChange={e => setNombreRuta(e.target.value)} className="border p-2 rounded" />
                    </label>
                </div>
                <div className="border-t pt-4 flex-1">
                    <h3 className="font-bold text-sm mb-3">Paradas Seleccionadas ({paradasSeleccionadas.length})</h3>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {paradasSeleccionadas.map((p, idx) => (
                            <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 text-sm border rounded">
                                <span><b>{idx + 1}.</b> {p.nombre}</span>
                                <button onClick={() => toggleParada(p)}><X size={16} className="text-red-500" /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-3 mt-auto pt-4 border-t">
                    <AppButton appearance="outline" onClick={handleCalcular} className="justify-center border-blue-600 text-blue-700" disabled={paradasSeleccionadas.length < 2}>
                        <Navigation size={18} className="mr-2" /> Calcular Trazo Real
                    </AppButton>
                    <AppButton appearance="filled" onClick={handleGuardar} className="justify-center bg-violet-600" disabled={!trazoCalculadoGeoJson}>
                        <Save size={18} className="mr-2" /> Guardar Ruta Definitiva
                    </AppButton>
                </div>
            </div>
            {/* Panel Derecho - MAPA */}
            <div className="flex-1 z-0 relative">
                <MapContainer center={[-12.0651, -75.2048]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    {/* Dibujar Paradas Totales */}
                    {paradasTotales.map(p => {
                        const seleccionada = paradasSeleccionadas.some(ps => ps.id === p.id);
                        return (
                            <Marker
                                key={p.id}
                                position={[p.lat, p.lng]}
                                eventHandlers={{ click: () => toggleParada(p) }}
                                opacity={seleccionada ? 1 : 0.6}
                            >
                                <Popup>{p.nombre}</Popup>
                            </Marker>
                        );
                    })}
                    {/* Dibujar Trazo Calculado */}
                    {trazoDibujo.length > 0 && (
                        <Polyline positions={trazoDibujo} color="#7c3aed" weight={6} opacity={0.8} />
                    )}
                </MapContainer>
            </div>
        </div>
    )
}
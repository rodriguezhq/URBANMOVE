import { useEffect, useState } from "react";
import type { LineaDto, ParadaDto } from "../Types/navegacionTypes";
import type { RutaListItem } from "../Types/rutasAdminType";
import { NavegacionService } from "../services/NavegacionService";
import { RutasAdminService } from "../services/RutasAdminService";
import { MapIcon, Navigation, Save, X, Plus, Trash2 } from "lucide-react";
import AppButton from "../Components/AppButton";
import AppInput from "../Components/AppInput";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from "react-leaflet";

export default function GestionRutasView() {
    const [lineas, setLineas] = useState<LineaDto[]>([]);
    const [paradasTotales, setParadasTotales] = useState<ParadaDto[]>([]);

    const [nombreRuta, setNombreRuta] = useState('');
    const [lineaId, setLineaId] = useState<number | ''>('');
    const [paradasSeleccionadas, setParadasSeleccionadas] = useState<ParadaDto[]>([]);

    const [trazoCalculadoGeoJson, setTrazoCalculadoGeoJson] = useState<string | null>(null);
    const [trazoDibujo, setTrazoDibujo] = useState<[number, number][]>([]);

    const [rutasExistentes, setRutasExistentes] = useState<RutaListItem[]>([]);
    const [nombreLineaNueva, setNombreLineaNueva] = useState('');
    const [modoNuevaParada, setModoNuevaParada] = useState(false);
    const [nombreParadaNueva, setNombreParadaNueva] = useState('');
    const [coordParadaNueva, setCoordParadaNueva] = useState<{ lat: number; lng: number } | null>(null);

    const cargarDatos = () => {
        NavegacionService.obtenerLineas().then(setLineas);
        NavegacionService.buscarParadas().then(setParadasTotales);
        RutasAdminService.listarRutas().then(setRutasExistentes);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const toggleParada = (parada: ParadaDto) => {
        if (paradasSeleccionadas.some(p => p.id === parada.id)) {
            setParadasSeleccionadas(prev => prev.filter(p => p.id !== parada.id));
        } else {
            setParadasSeleccionadas(prev => [...prev, parada]);
        }
        setTrazoCalculadoGeoJson(null);
        setTrazoDibujo([]);
    }

    const handleCalcular = async () => {
        if (paradasSeleccionadas.length < 2) return alert("Selecciona al menos 2 paradas en el mapa.")
        try {
            const req = { coordinates: paradasSeleccionadas.map(p => ({ lat: p.lat, lng: p.lng })) };
            const res = await RutasAdminService.calcularTrazo(req);
            setTrazoCalculadoGeoJson(res.geometry);

            const geo = JSON.parse(res.geometry);
            if (geo.type === "LineString") {
                const coordenadas = geo.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
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
            RutasAdminService.listarRutas().then(setRutasExistentes);
            setNombreRuta('');
            setParadasSeleccionadas([]);
            setTrazoCalculadoGeoJson(null);
            setTrazoDibujo([]);
        } catch (error) {
            alert("Error al guardar la ruta." + error);
        }
    };

    const handleCrearLinea = async () => {
        if (!nombreLineaNueva.trim()) return;
        try {
            await RutasAdminService.crearLinea({ nombre: nombreLineaNueva });
            setNombreLineaNueva('');
            NavegacionService.obtenerLineas().then(setLineas);
        } catch (error) {
            alert('Error al crear la línea: ' + error);
        }
    };

    const handleCrearParada = async () => {
        if (!nombreParadaNueva.trim() || !coordParadaNueva) return;
        try {
            await RutasAdminService.crearParada({ nombre: nombreParadaNueva, lat: coordParadaNueva.lat, lng: coordParadaNueva.lng });
            setNombreParadaNueva('');
            setCoordParadaNueva(null);
            setModoNuevaParada(false);
            NavegacionService.buscarParadas().then(setParadasTotales);
        } catch (error) {
            alert('Error al crear la parada: ' + error);
        }
    };

    const handleEliminarRuta = async (id: number) => {
        if (!confirm('¿Eliminar esta ruta? Esta acción no se puede deshacer.')) return;
        try {
            await RutasAdminService.eliminarRuta(id);
            setRutasExistentes(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert('Error al eliminar la ruta: ' + error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-60px)]">
            {/* Panel Izquierdo */}
            <div className="w-[35%] bg-white p-6 shadow-lg z-10 flex flex-col h-full">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-blue-950">
                        <MapIcon className="text-violet-600" /> Creador de Rutas
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Haz clic en los paraderos del mapa para unirlos en orden.</p>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-4 pr-1 mt-4">

                {/* Sección: Datos de la ruta */}
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                        Línea a la que pertenece
                        <select value={lineaId} onChange={e => setLineaId(Number(e.target.value))} className="border p-2 rounded">
                            <option value="">-- Selecciona Línea --</option>
                            {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                        </select>
                        <div className="flex gap-2 mt-1">
                            <AppInput
                                appearance="outline"
                                value={nombreLineaNueva}
                                onChange={(e) => setNombreLineaNueva(e.target.value)}
                                placeholder="Nueva línea (ej. Línea C)"
                                containerClassName="w-full"
                            />
                            <AppButton appearance="outline" onClick={handleCrearLinea} className="flex items-center justify-center shrink-0">
                                <Plus size={16} />
                            </AppButton>
                        </div>
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                        Nombre de la Ruta (ej. "Centro - Tambo")
                        <input type="text" value={nombreRuta} onChange={e => setNombreRuta(e.target.value)} className="border p-2 rounded" />
                    </label>
                </div>

                {/* Sección: Nueva parada */}
                <div className="border-t pt-3">
                    <h3 className="font-bold text-sm mb-2">Nueva parada</h3>
                    {!modoNuevaParada ? (
                        <AppButton appearance="outline" onClick={() => setModoNuevaParada(true)} className="flex items-center justify-center w-full">
                            <Plus size={16} className="mr-2" /> Marcar parada en el mapa
                        </AppButton>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-500">Haz clic en el mapa para fijar la ubicación.</p>
                            <AppInput
                                appearance="outline"
                                value={nombreParadaNueva}
                                onChange={(e) => setNombreParadaNueva(e.target.value)}
                                placeholder="Nombre de la parada"
                            />
                            <div className="flex gap-2">
                                <AppButton appearance="filled" disabled={!coordParadaNueva || !nombreParadaNueva.trim()} onClick={handleCrearParada} className="flex items-center justify-center w-full">
                                    Guardar parada
                                </AppButton>
                                <AppButton appearance="outline" onClick={() => { setModoNuevaParada(false); setCoordParadaNueva(null); }} className="flex items-center justify-center">
                                    <X size={16} />
                                </AppButton>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección: Paradas Seleccionadas */}
                <div className="border-t pt-3">
                    <h3 className="font-bold text-sm mb-2">Paradas Seleccionadas ({paradasSeleccionadas.length})</h3>
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {paradasSeleccionadas.map((p, idx) => (
                            <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 text-sm border rounded">
                                <span><b>{idx + 1}.</b> {p.nombre}</span>
                                <button onClick={() => toggleParada(p)}><X size={16} className="text-red-500" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                </div>

                {/* Sección: Rutas existentes */}
                <div className="border-t pt-3 mt-auto">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm">Rutas existentes ({rutasExistentes.length})</h3>
                        <div className="flex gap-1">
                            <AppButton appearance="outline" onClick={() => RutasAdminService.exportar('csv')} className="text-xs px-2 py-1">CSV</AppButton>
                            <AppButton appearance="outline" onClick={() => RutasAdminService.exportar('xml')} className="text-xs px-2 py-1">XML</AppButton>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {rutasExistentes.map(r => (
                            <div key={r.id} className="flex justify-between items-center bg-gray-50 p-2 text-sm border rounded">
                                <span className="truncate">{r.nombre} <span className="text-gray-400">· {r.lineaNombre} · {r.cantidadParadas} paradas</span></span>
                                <button onClick={() => handleEliminarRuta(r.id)}>
                                    <Trash2 size={16} className="text-red-500 shrink-0" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botones acción */}
                <div className="flex flex-col gap-2 pt-3 border-t">
                    <AppButton appearance="outline" onClick={handleCalcular} className="flex items-center justify-center border-blue-600 text-blue-700" disabled={paradasSeleccionadas.length < 2}>
                        <Navigation size={18} className="mr-2" /> Calcular Trazo Real
                    </AppButton>
                    <AppButton appearance="filled" onClick={handleGuardar} className="flex items-center justify-center bg-violet-600" disabled={!trazoCalculadoGeoJson}>
                        <Save size={18} className="mr-2" /> Guardar Ruta Definitiva
                    </AppButton>
                </div>
            </div>

            {/* Panel Derecho - MAPA */}
            <div className="flex-1 z-0 relative">
                <MapContainer center={[-12.0651, -75.2048]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    <CapturaClicMapa
                        activo={modoNuevaParada}
                        onClick={(lat, lng) => setCoordParadaNueva({ lat, lng })}
                    />
                    {coordParadaNueva && (
                        <Marker position={[coordParadaNueva.lat, coordParadaNueva.lng]}>
                            <Popup>Nueva parada aquí</Popup>
                        </Marker>
                    )}

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
                    {trazoDibujo.length > 0 && (
                        <Polyline positions={trazoDibujo} color="#7c3aed" weight={6} opacity={0.8} />
                    )}
                </MapContainer>
            </div>
        </div>
    )
}

function CapturaClicMapa({ activo, onClick }: { activo: boolean; onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (activo) onClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
}
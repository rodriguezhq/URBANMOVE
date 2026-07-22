import { useEffect, useState } from "react";
import type { LineaDto, ParadaDto } from "../Types/navegacionTypes";
import type { RutaListItem } from "../Types/rutasAdminType";
import { NavegacionService } from "../services/NavegacionService";
import { RutasAdminService } from "../services/RutasAdminService";
import { MapIcon, Navigation, Save, X, Plus, Trash2, List, MapPin, Route } from "lucide-react";
import AppButton from "../Components/AppButton";
import AppInput from "../Components/AppInput";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents, Tooltip } from "react-leaflet";
import L from 'leaflet';
import { useNotification } from "../Components/Toast";

const TABS = [
    { id: 'lineas', label: 'Líneas', icon: <List size={16} /> },
    { id: 'paradas', label: 'Paradas', icon: <MapPin size={16} /> },
    { id: 'rutas', label: 'Rutas', icon: <Route size={16} /> },
] as const;
type TabType = typeof TABS[number]['id'];

export default function GestionRutasView() {
    const [tab, setTab] = useState<TabType>('rutas');

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
    const {showSuccess, showDanger, showWarning} = useNotification()

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
        if (paradasSeleccionadas.length < 2) return showWarning("Selecciona al menos 2 paradas en el mapa.");
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
            showDanger('Error al calcular el trazo: ' + error);
        }
    }

    const handleGuardar = async () => {
        if (!nombreRuta || !lineaId || !trazoCalculadoGeoJson) return showWarning("Faltan datos o calcular el trazo.");
        try {
            await RutasAdminService.guardarRuta({
                nombre: nombreRuta,
                lineaId: Number(lineaId),
                geoJsonRecorrido: trazoCalculadoGeoJson,
                paradasIds: paradasSeleccionadas.map(p => p.id)
            });
            showSuccess("¡Ruta guardada exitosamente!");
            RutasAdminService.listarRutas().then(setRutasExistentes);
            setNombreRuta('');
            setParadasSeleccionadas([]);
            setTrazoCalculadoGeoJson(null);
            setTrazoDibujo([]);
        } catch (error) {
            showDanger("Error al guardar la ruta." + error);
        }
    };

    const handleCrearLinea = async () => {
        if (!nombreLineaNueva.trim()) return;
        try {
            await RutasAdminService.crearLinea({ nombre: nombreLineaNueva });
            setNombreLineaNueva('');
            showSuccess("Línea creada correctamente.");
            NavegacionService.obtenerLineas().then(setLineas);
        } catch (error) {
            showDanger('Error al crear la línea: ' + error);
        }
    };

    const handleCrearParada = async () => {
        if (!nombreParadaNueva.trim() || !coordParadaNueva) return;
        try {
            await RutasAdminService.crearParada({ nombre: nombreParadaNueva, lat: coordParadaNueva.lat, lng: coordParadaNueva.lng });
            setNombreParadaNueva('');
            setCoordParadaNueva(null);
            setModoNuevaParada(false);
            showSuccess("Parada guardada.");
            NavegacionService.buscarParadas().then(setParadasTotales);
        } catch (error) {
            showDanger('Error al crear la parada: ' + error);
        }
    };

    const handleEliminarRuta = async (id: number) => {
        if (!confirm('¿Eliminar esta ruta? Esta acción no se puede deshacer.')) return;
        try {
            await RutasAdminService.eliminarRuta(id);
            setRutasExistentes(prev => prev.filter(r => r.id !== id));
            showSuccess('Ruta eliminada exitosamente.');
        } catch (error) {
            showDanger('Error al eliminar la ruta: ' + error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-60px)]">
            {/* Panel Izquierdo */}
            <div className="w-[35%] bg-white shadow-lg z-10 flex flex-col h-full overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-blue-950">
                        <MapIcon className="text-violet-600" /> Creador de Rutas
                    </h1>
                </div>

                <div className="flex border-b border-gray-200 shrink-0">
                    {TABS.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setTab(t.id)} 
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-center border-b-2 transition-colors outline-none ${tab === t.id ? 'border-violet-600 text-violet-700 bg-violet-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Contenido según TAB */}
                <div className="flex-1 overflow-hidden">
                    {tab === 'lineas' && (
                        <div className="flex flex-col gap-4 p-4 h-full">
                            <div className="flex flex-col gap-2">
                                <h3 className="font-bold text-sm">Nueva Línea</h3>
                                <div className="flex gap-2">
                                    <AppInput 
                                        appearance="outline" 
                                        value={nombreLineaNueva} 
                                        onChange={e => setNombreLineaNueva(e.target.value)} 
                                        placeholder="Nombre (ej. Línea C)" 
                                        containerClassName="w-full" 
                                    />
                                    <AppButton appearance="filled" onClick={handleCrearLinea} disabled={!nombreLineaNueva.trim()} className="shrink-0 flex items-center justify-center">
                                        <Plus size={16}/>
                                    </AppButton>
                                </div>
                            </div>
                            <div className="border-t pt-4 flex-1 flex flex-col gap-2 min-h-0">
                                <h3 className="font-bold text-sm text-gray-700">Líneas Existentes ({lineas.length})</h3>
                                <div className="overflow-y-auto flex flex-col gap-1 pr-2">
                                    {lineas.map(l => (
                                        <div key={l.id} className="bg-gray-50 p-3 text-sm border border-gray-200 rounded-lg shadow-sm font-medium">
                                            {l.nombre}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'paradas' && (
                        <div className="flex flex-col gap-4 p-4 h-full">
                            <div className="flex flex-col gap-2">
                                <h3 className="font-bold text-sm text-gray-800">Nueva Parada</h3>
                                {!modoNuevaParada ? (
                                    <AppButton appearance="outline" onClick={() => setModoNuevaParada(true)} className="flex items-center justify-center w-full">
                                        <MapPin size={16} className="mr-2" /> Marcar parada en el mapa
                                    </AppButton>
                                ) : (
                                    <div className="flex flex-col gap-3 bg-violet-50 p-4 border border-violet-200 rounded-xl">
                                        <p className="text-xs text-violet-700 font-semibold flex items-center gap-1">
                                            <MapPin size={14}/> Haz clic en el mapa para fijar la ubicación.
                                        </p>
                                        <AppInput 
                                            appearance="outline" 
                                            value={nombreParadaNueva} 
                                            onChange={e => setNombreParadaNueva(e.target.value)} 
                                            placeholder="Nombre de la parada" 
                                        />
                                        <div className="flex gap-2">
                                            <AppButton appearance="filled" disabled={!coordParadaNueva || !nombreParadaNueva.trim()} onClick={handleCrearParada} className="w-full justify-center text-sm">
                                                Guardar
                                            </AppButton>
                                            <AppButton appearance="outline" onClick={() => { setModoNuevaParada(false); setCoordParadaNueva(null); }} className="justify-center shrink-0">
                                                <X size={16}/>
                                            </AppButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex-1 flex flex-col gap-2 min-h-0">
                                <h3 className="font-bold text-sm text-gray-700">Paradas Existentes ({paradasTotales.length})</h3>
                                <div className="overflow-y-auto flex flex-col gap-2 pr-2">
                                    {paradasTotales.map(p => (
                                        <div key={p.id} className="bg-gray-50 p-2 px-3 text-sm border border-gray-200 rounded-lg flex items-center justify-between">
                                            <span className="truncate font-medium text-gray-700">{p.nombre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'rutas' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                                {/* Formularios ruta */}
                                <div className="flex flex-col gap-4">
                                    <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                                        Línea
                                        <select value={lineaId} onChange={e => setLineaId(Number(e.target.value))} className="border border-gray-300 p-2.5 rounded-lg outline-none focus:border-violet-500">
                                            <option value="">-- Selecciona Línea --</option>
                                            {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                                        Nombre de la Ruta
                                        <input type="text" placeholder="Ej. Centro - Tambo" value={nombreRuta} onChange={e => setNombreRuta(e.target.value)} className="border border-gray-300 p-2.5 rounded-lg outline-none focus:border-violet-500" />
                                    </label>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-bold text-sm mb-1 text-gray-800">Paradas ({paradasSeleccionadas.length})</h3>
                                    <p className="text-xs text-gray-500 mb-3">Haz clic en los paraderos del mapa para unirlos en orden.</p>
                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                                        {paradasSeleccionadas.map((p, idx) => (
                                            <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 px-3 text-sm border border-gray-200 rounded-lg">
                                                <span><b className="text-violet-600 mr-1">{idx + 1}.</b> {p.nombre}</span>
                                                <button onClick={() => toggleParada(p)} className="p-1 hover:bg-red-100 rounded-md transition-colors"><X size={16} className="text-red-500" /></button>
                                            </div>
                                        ))}
                                        {paradasSeleccionadas.length === 0 && (
                                            <div className="text-sm text-gray-400 italic p-2 text-center border border-dashed rounded-lg">Ninguna parada seleccionada</div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-auto">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm text-gray-800">Rutas existentes ({rutasExistentes.length})</h3>
                                        <div className="flex gap-2">
                                            <AppButton appearance="outline" onClick={() => RutasAdminService.exportar('csv')} className="text-xs px-2 py-1 h-auto">CSV</AppButton>
                                            <AppButton appearance="outline" onClick={() => RutasAdminService.exportar('xml')} className="text-xs px-2 py-1 h-auto">XML</AppButton>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                                        {rutasExistentes.map(r => (
                                            <div key={r.id} className="flex justify-between items-center bg-gray-50 p-3 text-sm border border-gray-200 rounded-lg shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-blue-950 truncate">{r.nombre}</span>
                                                    <span className="text-xs text-gray-500">{r.lineaNombre} · {r.cantidadParadas} paradas</span>
                                                </div>
                                                <button onClick={() => handleEliminarRuta(r.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                                    <Trash2 size={16} className="text-red-500 shrink-0" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 p-4 border-t border-gray-200 bg-gray-50">
                                <AppButton appearance="outline" onClick={handleCalcular} className="flex justify-center border-blue-600 text-blue-700 bg-white" disabled={paradasSeleccionadas.length < 2}>
                                    <Navigation size={18} className="mr-2" /> Calcular Trazo Real
                                </AppButton>
                                <AppButton appearance="filled" onClick={handleGuardar} className="flex justify-center bg-violet-600" disabled={!trazoCalculadoGeoJson}>
                                    <Save size={18} className="mr-2" /> Guardar Ruta Definitiva
                                </AppButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Derecho - MAPA */}
            <div className="flex-1 z-0 relative">
                <MapContainer center={[-12.0651, -75.2048]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    <CapturaClicMapa
                        activo={tab === 'paradas' && modoNuevaParada}
                        onClick={(lat, lng) => setCoordParadaNueva({ lat, lng })}
                    />
                    {tab === 'paradas' && modoNuevaParada && coordParadaNueva && (
                        <Marker position={[coordParadaNueva.lat, coordParadaNueva.lng]}>
                            <Popup>Nueva parada aquí</Popup>
                        </Marker>
                    )}

                    {paradasTotales.map(p => {
                        const indexSeleccion = paradasSeleccionadas.findIndex(ps => ps.id === p.id);
                        const seleccionada = indexSeleccion !== -1;
                        const isOrigen = seleccionada && indexSeleccion === 0;
                        const isDestino = seleccionada && indexSeleccion === paradasSeleccionadas.length - 1 && paradasSeleccionadas.length > 1;

                        let colorClass = "bg-gray-400 w-3 h-3 mt-[4px] ml-[4px]"; // No seleccionada
                        let textColor = "text-gray-600";
                        let etiqueta = p.nombre;

                        if (tab === 'rutas') {
                            if (isOrigen) {
                                colorClass = "bg-green-500 w-5 h-5";
                                textColor = "text-green-700";
                                etiqueta = `Origen: ${p.nombre}`;
                            } else if (isDestino) {
                                colorClass = "bg-red-500 w-5 h-5";
                                textColor = "text-red-700";
                                etiqueta = `Destino: ${p.nombre}`;
                            } else if (seleccionada) {
                                colorClass = "bg-violet-500 w-4 h-4 mt-[2px] ml-[2px]";
                                textColor = "text-violet-700";
                                etiqueta = `Parada ${indexSeleccion + 1}: ${p.nombre}`;
                            }
                        } else {
                            colorClass = "bg-violet-500 w-3 h-3 mt-[4px] ml-[4px]";
                            textColor = "text-violet-700";
                        }

                        const customIcon = L.divIcon({
                            className: '',
                            html: `<div class="rounded-full shadow-sm border-2 border-white transition-colors duration-200 ${colorClass}"></div>`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        });

                        return (
                            <Marker
                                key={p.id}
                                position={[p.lat, p.lng]}
                                icon={customIcon}
                                eventHandlers={{ 
                                    click: () => {
                                        if (tab === 'rutas') toggleParada(p);
                                    } 
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                                    <span className={`font-bold ${textColor}`}>{etiqueta}</span>
                                </Tooltip>
                            </Marker>
                        );
                    })}
                    {tab === 'rutas' && trazoDibujo.length > 0 && (
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
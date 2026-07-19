import { useMemo, useState } from 'react';
import { ClipboardList, RefreshCcw, Trash2 } from 'lucide-react';
import Spinner from '../Components/Spinner';
import EstadoBadge from '../Components/IncidentesComponents/EstadoBadge';
import { useGestionIncidentes } from '../Hooks/useGestionIncidentes';
import type { CategoriaIncidente, EstadoIncidente } from '../Types/incidentesTypes';

const categorias: (CategoriaIncidente | 'Todas')[] = ['Todas', 'Accidente', 'Congestion', 'Vandalismo'];
const estados: (EstadoIncidente | 'Todos')[] = ['Todos', 'Pendiente', 'EnRevision', 'Resuelto'];

export default function GestionIncidentesView() {
    const {
        incidentes,
        cargando,
        error,
        cargarIncidentes,
        cambiarEstado,
        actualizandoId,
        eliminarIncidente,
        eliminandoId,
    } = useGestionIncidentes();

    const [filtroCategoria, setFiltroCategoria] = useState<CategoriaIncidente | 'Todas'>('Todas');
    const [filtroEstado, setFiltroEstado] = useState<EstadoIncidente | 'Todos'>('Todos');

    const incidentesFiltrados = useMemo(() => {
        return incidentes.filter((incidente) => {
            const coincideCategoria = filtroCategoria === 'Todas' || incidente.categoria === filtroCategoria;
            const coincideEstado = filtroEstado === 'Todos' || incidente.estado === filtroEstado;
            return coincideCategoria && coincideEstado;
        });
    }, [incidentes, filtroCategoria, filtroEstado]);

    const handleEliminar = (id: number) => {
        const confirmado = window.confirm('¿Eliminar este reporte de forma permanente?');
        if (confirmado) eliminarIncidente(id);
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <ClipboardList size={18} className="text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Gestión de incidentes</h1>
                        <p className="text-xs text-gray-500">Revisa y actualiza el estado de los reportes ciudadanos</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={cargarIncidentes}
                    className="flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm text-blue-950 hover:bg-gray-50"
                >
                    <RefreshCcw size={16} />
                    Actualizar
                </button>
            </header>

            <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap gap-4 border border-gray-200 bg-white p-4">
                    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-blue-950">
                        Categoría
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value as CategoriaIncidente | 'Todas')}
                            className="border border-gray-300 bg-white p-2 text-sm font-normal text-blue-950 focus:outline-none"
                        >
                            {categorias.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-blue-950">
                        Estado
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as EstadoIncidente | 'Todos')}
                            className="border border-gray-300 bg-white p-2 text-sm font-normal text-blue-950 focus:outline-none"
                        >
                            {estados.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {error && (
                    <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {cargando && (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <Spinner />
                        <p className="text-sm text-gray-400">Cargando reportes...</p>
                    </div>
                )}

                {!cargando && incidentesFiltrados.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                            <ClipboardList size={40} className="text-red-300" />
                        </div>
                        <p className="max-w-xs text-sm text-gray-400">No hay reportes con estos filtros</p>
                    </div>
                )}

                {!cargando && incidentesFiltrados.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {incidentesFiltrados.map((incidente) => (
                            <div key={incidente.id} className="flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row">
                                {incidente.imagenUrl && (
                                    <img
                                        src={incidente.imagenUrl}
                                        alt="Incidente"
                                        className="h-24 w-full shrink-0 object-cover sm:w-24"
                                    />
                                )}
                                <div className="flex flex-1 flex-col gap-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-950">{incidente.categoria}</span>
                                            <EstadoBadge estado={incidente.estado} />
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(incidente.fechaRegistro).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{incidente.descripcion}</p>
                                    <p className="text-xs text-gray-500">Reportado por {incidente.usuarioNombre}</p>
                                    <p className="text-xs text-gray-400">
                                        Lat {incidente.lat.toFixed(5)}, Lng {incidente.lng.toFixed(5)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:w-64">
                                    <select
                                        value={incidente.estado}
                                        disabled={actualizandoId === incidente.id || eliminandoId === incidente.id}
                                        onChange={(e) => cambiarEstado(incidente.id, e.target.value as EstadoIncidente)}
                                        className="w-full border border-gray-300 bg-white p-2 text-sm font-normal text-blue-950 focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="EnRevision">En revisión</option>
                                        <option value="Resuelto">Resuelto</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminar(incidente.id)}
                                        disabled={eliminandoId === incidente.id || actualizandoId === incidente.id}
                                        title="Eliminar reporte"
                                        className="flex h-9 w-9 shrink-0 items-center justify-center border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {eliminandoId === incidente.id ? <Spinner size={16} /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
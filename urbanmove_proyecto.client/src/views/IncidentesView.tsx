import { useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import AppButton from '../Components/AppButton';
import Spinner from '../Components/Spinner';
import { useIncidentes } from '../Hooks/useIncidentes';
import type { CategoriaIncidente, EstadoIncidente } from '../Types/incidentesTypes';

const categorias: { value: CategoriaIncidente; label: string }[] = [
    { value: 'Accidente', label: 'Accidente' },
    { value: 'Congestion', label: 'Congestión' },
    { value: 'Vandalismo', label: 'Vandalismo' },
];

function EstadoBadge({ estado }: { estado: EstadoIncidente }) {
    if (estado === 'Pendiente') {
        return (
            <span className="inline-flex items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                <Clock size={12} />
                Pendiente
            </span>
        );
    }
    if (estado === 'EnRevision') {
        return (
            <span className="inline-flex items-center gap-1 border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                <Search size={12} />
                En revisión
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 border border-green-300 bg-green-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
            <CheckCircle2 size={12} />
            Resuelto
        </span>
    );
}

export default function IncidentesView() {
    const {
        misIncidentes,
        cargandoLista,
        errorLista,
        crearIncidente,
        enviando,
        errorEnvio,
        envioExitoso,
        obtenerUbicacionActual,
        obteniendoUbicacion,
        errorUbicacion,
    } = useIncidentes();

    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState<CategoriaIncidente>('Accidente');
    const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
    const [imagen, setImagen] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleUbicacion = async () => {
        const resultado = await obtenerUbicacionActual();
        if (resultado) setUbicacion(resultado);
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0] ?? null;
        setImagen(archivo);
        setPreviewUrl(archivo ? URL.createObjectURL(archivo) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ubicacion) return;

        const exito = await crearIncidente({
            descripcion,
            categoria,
            lat: ubicacion.lat,
            lng: ubicacion.lng,
            imagen,
        });

        if (exito) {
            setDescripcion('');
            setCategoria('Accidente');
            setUbicacion(null);
            setImagen(null);
            setPreviewUrl(null);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle size={18} className="text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Reportar incidente</h1>
                        <p className="text-xs text-gray-500">
                            Reporta accidentes, congestión o vandalismo en las rutas
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row lg:items-start">
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full shrink-0 flex-col gap-4 border border-gray-200 bg-white p-5 lg:w-96"
                >
                    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-blue-950">
                        Descripción
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                            minLength={5}
                            maxLength={300}
                            rows={4}
                            className="resize-none border border-gray-300 bg-white p-2.5 text-sm font-normal text-blue-950 focus:outline-none"
                            placeholder="Describe el incidente"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-blue-950">
                        Categoría
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value as CategoriaIncidente)}
                            className="border border-gray-300 bg-white p-2.5 text-sm font-normal text-blue-950 focus:outline-none"
                        >
                            {categorias.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </label>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-blue-950">Ubicación</span>
                        <AppButton
                            type="button"
                            appearance="outline"
                            onClick={handleUbicacion}
                            disabled={obteniendoUbicacion}
                            className="flex items-center justify-center gap-2"
                        >
                            {obteniendoUbicacion ? <Spinner size={16} /> : <MapPin size={16} />}
                            {ubicacion ? 'Actualizar ubicación' : 'Usar mi ubicación actual'}
                        </AppButton>
                        {ubicacion && (
                            <p className="text-xs text-gray-500">
                                Lat {ubicacion.lat.toFixed(5)}, Lng {ubicacion.lng.toFixed(5)}
                            </p>
                        )}
                        {errorUbicacion && (
                            <p className="text-xs text-red-600">{errorUbicacion}</p>
                        )}
                    </div>

                    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-blue-950">
                        Foto (opcional)
                        <div className="flex items-center gap-3 border border-gray-300 bg-white p-2.5">
                            <Camera size={18} className="text-gray-400" />
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImagenChange}
                                className="w-full text-sm font-normal text-blue-950 file:hidden"
                            />
                        </div>
                    </label>

                    {previewUrl && (
                        <img src={previewUrl} alt="Vista previa" className="h-40 w-full object-cover" />
                    )}

                    {errorEnvio && (
                        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorEnvio}
                        </p>
                    )}

                    {envioExitoso && (
                        <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            Reporte enviado correctamente
                        </p>
                    )}

                    <AppButton
                        type="submit"
                        disabled={enviando || !ubicacion || descripcion.length < 10}
                        className="flex items-center justify-center gap-2"
                    >
                        {enviando && <Spinner size={16} />}
                        Enviar reporte
                    </AppButton>
                </form>

                <section className="flex flex-1 flex-col gap-4">
                    <h2 className="text-base font-bold text-blue-950">Mis reportes</h2>

                    {errorLista && (
                        <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            {errorLista}
                        </div>
                    )}

                    {cargandoLista && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20">
                            <Spinner />
                            <p className="text-sm text-gray-400">Cargando tus reportes...</p>
                        </div>
                    )}

                    {!cargandoLista && misIncidentes.length === 0 && !errorLista && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                                <AlertTriangle size={40} className="text-red-300" />
                            </div>
                            <p className="max-w-xs text-sm text-gray-400">
                                Todavía no has reportado ningún incidente
                            </p>
                        </div>
                    )}

                    {!cargandoLista && misIncidentes.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {misIncidentes.map((incidente) => (
                                <div key={incidente.id} className="flex gap-4 border border-gray-200 bg-white p-4">
                                    {incidente.imagenUrl && (
                                        <img
                                            src={incidente.imagenUrl}
                                            alt="Incidente"
                                            className="h-20 w-20 shrink-0 object-cover"
                                        />
                                    )}
                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-blue-950">{incidente.categoria}</span>
                                            <EstadoBadge estado={incidente.estado} />
                                        </div>
                                        <p className="text-sm text-gray-600">{incidente.descripcion}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(incidente.fechaRegistro).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

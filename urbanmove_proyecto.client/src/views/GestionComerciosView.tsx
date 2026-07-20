import { useState } from 'react';
import { Pencil, Plus, RefreshCcw, Store, Trash2, X } from 'lucide-react';
import Spinner from '../Components/Spinner';
import AppButton from '../Components/AppButton';
import AppInput from '../Components/AppInput';
import { useGestionComercios } from '../Hooks/useGestionComercios';
import type { Comercio, CrearComercioInput } from '../Types/fidelizacionTypes';

const FORM_VACIO: CrearComercioInput = { nombre: '', direccion: '', lat: 0, lng: 0 };

/**
 * Vista de administración del módulo RF-05: gestión de comercios aliados.
 * Accesible desde /app/comercios (solo admin).
 */
export default function GestionComerciosView() {
    const { comercios, cargando, error, guardando, eliminandoId, cargar, crear, actualizar, eliminar } =
        useGestionComercios();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState<Comercio | null>(null);
    const [form, setForm] = useState<CrearComercioInput>(FORM_VACIO);

    const abrirCrear = () => {
        setEditando(null);
        setForm(FORM_VACIO);
        setMostrarForm(true);
    };

    const abrirEditar = (comercio: Comercio) => {
        setEditando(comercio);
        setForm({
            nombre: comercio.nombre,
            direccion: comercio.direccion,
            lat: comercio.lat,
            lng: comercio.lng,
        });
        setMostrarForm(true);
    };

    const cerrarForm = () => {
        setMostrarForm(false);
        setEditando(null);
    };

    const handleGuardar = async () => {
        const ok = editando
            ? await actualizar(editando.id, form)
            : await crear(form);

        if (ok) cerrarForm();
    };

    const handleEliminar = (id: number) => {
        const confirmado = window.confirm('¿Eliminar este comercio aliado de forma permanente?');
        if (confirmado) eliminar(id);
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                        <Store size={18} className="text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Comercios aliados</h1>
                        <p className="text-xs text-gray-500">Gestiona los comercios donde los ciudadanos canjean puntos</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <AppButton
                        appearance="outline"
                        disabled={cargando}
                        onClick={cargar}
                        className="flex items-center gap-2 border-gray-300 text-gray-600"
                    >
                        <RefreshCcw size={16} className={cargando ? 'animate-spin' : ''} />
                        Actualizar
                    </AppButton>
                    <AppButton onClick={abrirCrear} className="flex items-center gap-2">
                        <Plus size={16} />
                        Nuevo comercio
                    </AppButton>
                </div>
            </header>

            <div className="flex flex-col gap-4 p-6">
                {error && (
                    <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ── Formulario crear/editar ── */}
                {mostrarForm && (
                    <div className="flex flex-col gap-4 border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-blue-950">
                                {editando ? 'Editar comercio' : 'Nuevo comercio'}
                            </h2>
                            <button type="button" onClick={cerrarForm} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <AppInput
                                label="Nombre"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            />
                            <AppInput
                                label="Dirección"
                                value={form.direccion}
                                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                            />
                            <AppInput
                                label="Latitud"
                                type="number"
                                value={String(form.lat)}
                                onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                            />
                            <AppInput
                                label="Longitud"
                                type="number"
                                value={String(form.lng)}
                                onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <AppButton appearance="outline" onClick={cerrarForm} disabled={guardando}>
                                Cancelar
                            </AppButton>
                            <AppButton onClick={handleGuardar} disabled={guardando || !form.nombre || !form.direccion}>
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </AppButton>
                        </div>
                    </div>
                )}

                {/* ── Cargando ── */}
                {cargando && comercios.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <Spinner />
                        <p className="text-sm text-gray-400">Cargando comercios...</p>
                    </div>
                )}

                {/* ── Lista vacía ── */}
                {!cargando && comercios.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                            <Store size={40} className="text-green-300" />
                        </div>
                        <p className="max-w-xs text-sm text-gray-400">Aún no hay comercios aliados registrados</p>
                    </div>
                )}

                {/* ── Tabla de comercios ── */}
                {comercios.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {comercios.map((c) => (
                            <div
                                key={c.id}
                                className="flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-blue-950">{c.nombre}</p>
                                    <p className="text-xs text-gray-500">{c.direccion}</p>
                                    <p className="text-xs text-gray-400">
                                        Lat: {c.lat.toFixed(4)}, Lng: {c.lng.toFixed(4)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <AppButton
                                        appearance="outline"
                                        onClick={() => abrirEditar(c)}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <Pencil size={14} />
                                        Editar
                                    </AppButton>
                                    <AppButton
                                        appearance="outline"
                                        disabled={eliminandoId === c.id}
                                        onClick={() => handleEliminar(c.id)}
                                        className="flex items-center gap-2 border-red-200 text-xs text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                        {eliminandoId === c.id ? 'Eliminando...' : 'Eliminar'}
                                    </AppButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
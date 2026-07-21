import { Edit, HardHat, Pyramid, Triangle, User, X } from "lucide-react"
import Skeleton from "../Components/Skeleton"
import { useAuth } from "../Hooks/useAuth"
import AppInput from "../Components/AppInput"
import { useEffect, useRef, useState } from "react"
import AppButton from "../Components/AppButton"
import type { UserType } from "../Types/authType"
import { useNotification } from "../Components/Toast"
import { AuthService } from "../services/AuthService"

export default function PerfilView() {
    const { user, loading } = useAuth()

    return (
        <div className="h-screen grid grid-rows-[auto_1fr]">
            <header className="bg-gradient-to-br from-violet-600 to-purple-900 overflow-hidden relative">
                <div aria-hidden className='rounded-full bg-white/10 absolute bottom-0 right-0 aspect-square w-50 md:w-100 translate-y-1/2 translate-x-1/2' />
                <div aria-hidden className='rounded-full bg-white/10 absolute bottom-0 right-0 aspect-square w-150 md:w-300 translate-y-1/2 translate-x-1/2' />
                <div className="flex items-center justify-start gap-2 md:gap-6 p-4 md:p-16 md:pb-4 md:pl-6">
                    <div className="bg-white/5 aspect-square flex items-center justify-center w-16 *:text-white">
                        {
                            loading
                                ? <Skeleton className="h-50" />
                                : (
                                    <>
                                        {user?.role === "admin" && <Pyramid size={32} />}
                                        {user?.role === "operador" && <HardHat size={32} />}
                                        {user?.role === "ciudadano" && <User size={32} />}
                                    </>
                                )
                        }
                    </div>
                    <section className="flex flex-col items-start justify-center text-white">
                        {
                            loading
                                ? <Skeleton className="h-50" />
                                : (
                                    <>
                                        <h1 className="text-2xl font-semibold">{user?.fullName}</h1>
                                        <h2 className="text-lg opacity-75">{user?.email}</h2>
                                    </>
                                )
                        }


                    </section>
                </div>
            </header>
            <div className="overflow-y-auto flex flex-col items-center justify-start py-4 px-4 md:pt-20 gap-4 md:gap-18">
                {
                    loading
                        ? <Skeleton className="h-50 w-100" />
                        : user && <>
                            <PersonalDataForm user={user} />
                            <PasswordForm />
                        </>
                }
            </div>
        </div>
    )
}

function PersonalDataForm({ user }: { user: UserType }) {
    const [enableEdit, setEnableEdit] = useState(false);
    const [nombres, setNombres] = useState(user.nombres);
    const [apellidos, setApellidos] = useState(user.apellidos);
    const [email, setEmail] = useState(user.email);
    const { showDanger, showWarning, showSuccess , showBrand, showNeutral} = useNotification()

    const handleEnableEdit = () => {
        setEnableEdit(!enableEdit);
        if (!enableEdit) { // enable
            
        } else { // cancel
            setNombres(user.nombres);
            setApellidos(user.apellidos);
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (nombres === user.nombres && apellidos === user.apellidos && email === user.email) {
            showWarning("No hay cambios en los datos personales.")
            return;
        }
        try {
            await AuthService.editarDatosPersonales(nombres, apellidos, email);
            showSuccess("Datos personales actualizados correctamente.")
            setEnableEdit(false);
        } catch (error) {
            showDanger("Error al actualizar los datos personales.")
        }
    }

    return (
        <form className="relative shadow p-4 w-3xl max-w-full" onSubmit={handleSubmit}>
            <AppButton className="absolute top-0 right-0 p-2!" onClick={handleEnableEdit} title={enableEdit ? "Cancelar edición" : "Editar datos"} >
                {
                    enableEdit
                        ? <><X /></>
                        : <><Edit /></>
                }
            </AppButton>

            <fieldset>
                <legend className="text-lg font-semibold mb-4">
                    Datos Personales
                </legend>

                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <AppInput
                            appearance={enableEdit ? 'outline' : 'transparent'}
                            type="text"
                            value={nombres}
                            onChange={(e) => setNombres(e.target.value)}
                            disabled={!enableEdit}
                            label={"Nombres"}
                        />
                        <AppInput
                            appearance={enableEdit ? 'outline' : 'transparent'}
                            type="text"
                            value={apellidos}
                            onChange={(e) => setApellidos(e.target.value)}
                            disabled={!enableEdit}
                            label={"Apellidos"}
                        />
                    </div>
                    <AppInput
                        appearance={enableEdit ? 'outline' : 'transparent'}
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!enableEdit}
                        label={"Correo electrónico"}
                    />
                </div>
            </fieldset>
            <div>
                {
                    enableEdit && <AppButton type="submit" className="mt-4">
                        Guardar cambios
                    </AppButton>
                }
            </div>

        </form>
    )
}

function PasswordForm() {
    const [enableEdit, setEnableEdit] = useState(false);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const { showDanger, showWarning, showSuccess } = useNotification()

    const handleToggleEdit = () => {
        setEnableEdit(!enableEdit);

        if (enableEdit) {
            console.log("Cancelando edición de contraseña");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showWarning("Por favor, complete todos los campos.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showWarning("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        try{
            await AuthService.editarPassword(currentPassword, newPassword, confirmNewPassword);
            showSuccess("Contraseña actualizada correctamente.");
            setEnableEdit(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }catch(error){
            showDanger("Error al actualizar la contraseña.");
        }
    }


    return (
        <form className="relative shadow p-4 w-3xl max-w-full" onSubmit={handleSubmit}>
            <AppButton className="absolute top-0 right-0 p-2!" onClick={handleToggleEdit} title={enableEdit ? "Cancelar edición" : "Editar datos"} >
                {
                    enableEdit
                        ? <><X /></>
                        : <><Edit /></>
                }
            </AppButton>

            <fieldset>
                <legend className="text-lg font-semibold mb-4">
                    Cambiar Contraseña
                </legend>
                <div className="flex flex-col gap-4">
                    <AppInput
                        appearance={enableEdit ? 'outline' : 'transparent'}
                        type="password"
                        label="Contraseña actual"
                        disabled={!enableEdit}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <hr className="opacity-10" />
                    <AppInput
                        appearance={enableEdit ? 'outline' : 'transparent'}
                        type="password"
                        label="Nueva contraseña"
                        disabled={!enableEdit}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <AppInput
                        appearance={enableEdit ? 'outline' : 'transparent'}
                        type="password"
                        label="Confirmar nueva contraseña"
                        disabled={!enableEdit}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </div>
            </fieldset>
            <div>
                {
                    enableEdit && <AppButton type="submit" className="mt-4">
                        Cambiar contraseña
                    </AppButton>
                }
            </div>
        </form >
    )
}
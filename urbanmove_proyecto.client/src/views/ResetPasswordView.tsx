import { useSearchParams } from "react-router-dom";
import AppInput from "../Components/AppInput";
import { useState } from "react";
import AppButton from "../Components/AppButton";
import { AuthService } from "../services/AuthService";
import Spinner from "../Components/Spinner";
import AppLink from "../Components/AppLink";
import { ChevronLeft } from "lucide-react";

export default function ResetPasswordView() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [params, _] = useSearchParams();
    const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setState("loading");
        try {
            const email = params.get("email") || "";
            const token = params.get("token") || "";
            await AuthService.sendResetPassword(email, token, newPassword, confirmPassword);
            setState("success");
        } catch (error) {
            setState("error");
        }
    }

    return (
        <>
            <div>
                {
                    state === "success"
                        ? (
                            <div className="flex flex-col items-center justify-center gap-4 p-4 bg-green-50 rounded-lg">
                                <p className="text-green-600 text-center">Se ha cambiado la contraseña correctamente</p>
                                <AppLink to="/" appearance="transparent" className="self-start flex items-center justify-center gap-2 p-0 text-inherit">
                                    <ChevronLeft />
                                    Ir al inicio
                                </AppLink>
                            </div>
                        )
                        : (
                            <>
                                <form onSubmit={handleSubmit} className="flex flex-col justify-center items-start gap-5">
                                    <h2 className='text-3xl lg:text-5xl font-medium pb-6 lg:pb-24'>
                                        <span className='text-violet-600 font-bold'>
                                            Recupera
                                        </span>
                                        <br />
                                        tu contraseña
                                    </h2>
                                    <AppInput
                                        label="Nueva contraseña"
                                        appearance='filled'
                                        type="password"
                                        containerClassName='w-full px-0'
                                        className="pr-0"
                                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <AppInput
                                        label="Confirmar contraseña"
                                        appearance='filled'
                                        type="password"
                                        containerClassName='w-full px-0'
                                        className="pr-0"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <AppButton appearance="filled" type="submit" className="flex items-center justify-center px-2" title="Enviar" disabled={state === "loading"}>
                                        {
                                            state === "loading"
                                                ? <Spinner />
                                                : "Enviar"
                                        }
                                    </AppButton>
                                </form>
                                {
                                    state === "error" && (
                                        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-red-50 rounded-lg">
                                            <p className="text-red-600 text-center">Ha ocurrido un error al intentar cambiar la contraseña</p>
                                        </div>
                                    )
                                }
                            </>
                        )
                }
            </div>
        </>
    )
}
import { ChevronLeft, Info, SendHorizonal } from "lucide-react";
import AppLink from "../Components/AppLink";
import AppInput from "../Components/AppInput";
import AppButton from "../Components/AppButton";
import React, { useState } from "react";
import { AuthService } from "../services/AuthService";
import Spinner from "../Components/Spinner";

function RecoverPasswordView() {
    const [email, setEmail] = useState("")
    const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setState("loading");
        try {
            var response = await AuthService.sendRecoverPasswordEmail(email);
            setState("success");
        } catch (error) {
            setState("error");
        }
    }

    return (
        <div className="flex flex-col gap-6 items-center justify-center">
            <form onSubmit={handleSubmit} className="">
                <h2 className='text-3xl lg:text-5xl font-medium pb-6 lg:pb-24'>
                    <span className='text-violet-600 font-bold'>
                        Recupera
                    </span>
                    <br />
                    tu contraseña
                </h2>

                <AppInput
                    label="Correo de tu cuenta"
                    appearance='filled'
                    type="email"
                    containerClassName='w-full px-0'
                    className="pr-0"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    trailing={
                        <AppButton appearance="filled" type="submit" className="flex items-center justify-center aspect-square px-2" title="Enviar" disabled={state === "loading"}>
                            {
                                state === "loading"
                                    ? <Spinner />
                                    : <SendHorizonal />
                            }
                        </AppButton>
                    }
                />

                <legend className="p-4 shadow mt-6 flex gap-4">
                    <Info className="self-center shrink-0 grow-0 basis-auto" />
                    <p >
                        Enviaremos un <strong>correo</strong> con un enlace donde podrás <br></br> recuperar el acceso a tu cuenta
                    </p>
                </legend>
            </form>
            {state === "success" && (
                <div className="flex flex-col items-center justify-center gap-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-600 text-center">Se ha enviado un correo a <strong>{email}</strong> con un enlace para recuperar tu contraseña</p>
                </div>
            )}
            {state === "error" && (
                <div className="flex flex-col items-center justify-center gap-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-center">Ha ocurrido un error al intentar enviar el correo de recuperación</p>
                </div>
            )}
            <AppLink to="/login" appearance="transparent" className="self-start flex items-center justify-center gap-2 px-0">
                <ChevronLeft />
                Volver
            </AppLink>
        </div>
    );
}

export default RecoverPasswordView;
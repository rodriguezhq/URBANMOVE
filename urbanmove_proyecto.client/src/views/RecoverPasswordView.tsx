import { ChevronLeft, Info, SendHorizonal } from "lucide-react";
import AppLink from "../Components/AppLink";
import AppInput from "../Components/AppInput";
import AppButton from "../Components/AppButton";
import { useState } from "react";

function RecoverPasswordView() {
    const [email, setEmail] = useState("")

    const handleSubmit = () => {

    }

    return (
        <div className="flex flex-col gap-6 items-center justify-center">
            <form action={handleSubmit} className="">
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
                        <AppButton appearance="filled" className="flex items-center justify-center aspect-square px-2" title="Enviar">
                            <SendHorizonal />
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
            <AppLink to="/login" appearance="transparent" className="self-start flex items-center justify-center gap-2 px-0">
                <ChevronLeft />
                Volver
            </AppLink>
        </div>
    );
}

export default RecoverPasswordView;
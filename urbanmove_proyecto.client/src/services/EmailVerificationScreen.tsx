import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Spinner from "../Components/Spinner"
import AppLink from "../Components/AppLink"
import { AuthService } from "./AuthService"

export default function EmailVerificationScreen() {
    const [params, setParams] = useSearchParams()
    const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessages, setErrorMessages] = useState<string[]>([])

    const ConfirmEmailBackend = async () => {
        const email = params.get('email')
        const token = params.get('token')
        if (!email || !token) {
            setState('error')
            setErrorMessages(['Faltan parámetros de correo electrónico o token.'])
            return
        }
        try {
            await AuthService.sendConfirmEmail(email, token)
            setState('success')
        } catch (error: any) {
            setState('error')
            if (error.response && error.response.data && error.response.data.errors) {
                setErrorMessages(error.response.data.errors)
            }
        }
    }

    useEffect(() => {
        ConfirmEmailBackend()
    }, [])

    return (

            <article className="flex flex-col items-center justify-center gap-4 p-8 bg-white shadow-md">
                {
                    state === 'loading'
                        ? (
                            <>
                                <Spinner />
                                <p className="text-center text-violet-600">Verificando correo electrónico...</p>
                            </>
                        )
                        : state === 'success'
                            ? (
                                <>
                                    <p className="text-center text-green-600">Correo electrónico verificado con éxito.</p>
                                    <AppLink to="/">
                                        Ir a la página de inicio
                                    </AppLink>
                                </>
                            )
                            : (
                                <>
                                    <p className="text-center text-red-600">Error al verificar el correo electrónico.</p>
                                    <ul className="list-disc list-inside text-red-600">
                                        {errorMessages.map((msg, index) => (
                                            <li key={index}>{msg}</li>
                                        ))}
                                    </ul>
                                </>
                            )
                }
            </article>
    )
}
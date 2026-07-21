import { useNavigate } from "react-router-dom";
import AppButton from "../Components/AppButton";
import { ChevronLeft, Eye, EyeOff, IdCard, Lock, Mail, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppInput from '../Components/AppInput';
import Spinner from '../Components/Spinner';
import { useAuth } from '../Hooks/useAuth';
import { isAxiosError } from 'axios';
import AppLink from "../Components/AppLink";

function Register() {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, user, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setSubmitting(true);
        try {
            await register({ nombres: name, apellidos: lastName, dni, email, password, confirmPassword });
            navigate('/app');
        } catch (err) {
            if (isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('No se completo el registro');
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/app');
        }
    }, [user]);

    return (<>
        {
            loading
                ? <div className="flex flex-col items-center justify-center gap-4">
                    <Spinner />
                </div>
                :
                <form onSubmit={handleSubmit} className="flex flex-col justify-center items-start gap-5">
                    <h2 className='text-3xl lg:text-5xl font-medium pb-6 lg:pb-24'>
                        <span className='text-violet-600 font-bold'>
                            Crea tu cuenta
                        </span>
                        <br />
                        Unete a URBANMOVE
                    </h2>

                    <div className='flex w-full gap-3'>
                        <AppInput
                            label="Nombre"
                            appearance='filled'
                            type="text"
                            containerClassName='w-full'
                            value={name} onChange={(e) => setName(e.target.value)}
                            leading={<User />} />
                        <AppInput
                            label="Apellido"
                            appearance='filled'
                            type="text"
                            containerClassName='w-full'
                            value={lastName} onChange={(e) => setLastName(e.target.value)}
                            leading={<User />} />
                        <AppInput
                            label="DNI"
                            appearance='filled'
                            type="text"
                            containerClassName='w-full'
                            value={dni} onChange={(e) => setDni(e.target.value)}
                            leading={<IdCard />} />
                    </div>

                    <div className='flex w-full gap-3'>
                        <AppInput
                            label="Correo"
                            appearance='filled'
                            type="email"
                            containerClassName='w-full'
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            leading={<Mail />} />
                    </div>

                    <AppInput
                        label="Contraseña"
                        appearance='filled'
                        type={showPassword ? "text" : "password"}
                        containerClassName='w-full'
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        leading={<Lock />}
                        trailing={
                            <AppButton
                                type='button'
                                appearance='transparent'
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {
                                    showPassword ? <EyeOff /> : <Eye />
                                }
                            </AppButton>
                        }
                    />

                    <AppInput
                        label="Confirmar contraseña"
                        appearance='filled'
                        type={showConfirmPassword ? "text" : "password"}
                        containerClassName='w-full'
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        leading={<Lock />}
                        trailing={
                            <AppButton
                                type='button'
                                appearance='transparent'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {
                                    showConfirmPassword ? <EyeOff /> : <Eye />
                                }
                            </AppButton>
                        }
                    />

                    <AppButton disabled={submitting || loading} type='submit' className='w-full'>
                        {submitting ? <><Spinner /> registrando...</> : 'Registrarse'}
                    </AppButton>
                    <AppLink disabled={submitting || loading} type='button' appearance='subtle' to="/login" className='flex items-center justify-start gap-2'>
                        <ChevronLeft /> Iniciar sesión
                    </AppLink>

                    {error && (
                        <div className="rounded-md border border-red-700 bg-red-50 px-3 py-2">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}
                </form>
        }
    </>
    );
}

export default Register;
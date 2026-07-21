import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppButton from '../Components/AppButton';
import { useAuth } from '../Hooks/useAuth';
import { HealthCheckService } from '../services/HealthCheckService';
import { ChevronRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AppInput from '../Components/AppInput';
import Spinner from '../Components/Spinner';
import AppLink from '../Components/AppLink';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { Login, user, loading } = useAuth();
    const navigate = useNavigate();

    const checkHealth = async () => {
        try {
            const ok = await HealthCheckService.Check();
            console.log('Health check:', ok);
        } catch {
            console.error('Health check failed');
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await Login({ email, password });
            navigate('/app');
        } catch {
            setError('Correo o contraseña incorrectos');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/app');
        }
    }, [user]);

    useEffect(() => {
        checkHealth();
    }, []);


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
                            Hola,
                        </span>
                        <br />
                        Bienvenido de vuelta
                    </h2>

                    <AppInput
                        label="Correo"
                        appearance='filled'
                        type="email"
                        containerClassName='w-full'
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        leading={<Mail />} />
                    <AppInput
                        label="Contraseña"
                        appearance='filled'
                        type={showPassword ? "text" : "password"}
                        containerClassName='w-full'
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        leading={<Lock />}
                        trailing={
                            <AppButton
                                appearance='transparent'
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {
                                    showPassword ? <EyeOff /> : <Eye />
                                }
                            </AppButton>
                        }
                    />
                    <AppLink appearance="transparent" to="/recover-password" className="self-end -mt-4 p-0 hover:underline" >
                        Olvidé mi contraseña
                    </AppLink>

                    <AppButton disabled={submitting || loading} type='submit' className='w-full'>
                        {submitting ? <><Spinner /> ingresando...</> : 'Ingresar'}
                    </AppButton>
                    <AppLink disabled={submitting || loading} type='button' appearance='subtle' to="/register" className='flex items-center self-start justify-start gap-2'>
                         Registrarse <ChevronRight />
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

export default Login;

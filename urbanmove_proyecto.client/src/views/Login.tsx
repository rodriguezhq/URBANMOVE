import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppButton from '../Components/AppButton';
import { useAuth } from '../Hooks/useAuth';
import { HealthCheckService } from '../services/HealthCheckService';
import { Bike, Car, Eye, EyeClosed, EyeOff, Leaf, Lock, Mail, Navigation, TrainFront } from 'lucide-react';
import AppInput from '../Components/AppInput';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [health, setHealth] = useState('');

    const { Login, user } = useAuth();
    const navigate = useNavigate();

    const checkHealth = async () => {
        try {
            const ok = await HealthCheckService.Check();
            setHealth(ok ? '' : '');
        } catch {
            setHealth('Error');
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/');
        }
        checkHealth();
    }, []);

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await Login({ email, password });
            navigate('/');
        } catch {
            setError('Correo o contraseña incorrectos');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 grid-rows-[1fr_2fr] min-h-screen lg:grid-cols-2 lg:grid-rows-1 bg-gradient-to-br from-violet-600 to-purple-900 overflow-hidden">
            <aside className='relative px-4 py-6 lg:p-16 text-white flex flex-col justify-between'>
                <div aria-hidden className='rounded-full bg-white/10 absolute bottom-0 right-0 aspect-square w-100 translate-y-1/2 translate-x-1/2' />
                <div aria-hidden className='rounded-full bg-white/10 absolute bottom-0 right-0 aspect-square w-300 translate-y-1/2 translate-x-1/2' />
                <div className="flex items-center gap-2">
                    <Leaf size={28} />
                    <span className="text-xl font-bold tracking-wide">URBANMOVE</span>
                </div>
                <div className=''>
                    <div className="mb-6 flex gap-3 text-white *:bg-white/20 *:rounded-md *:p-3 *:backdrop-blur-sm *:shadow-md *:shadow-black/10">
                        <span>
                            <Bike size={24} />
                        </span>
                        <span>
                            <Car size={24} />
                        </span>
                        <span>
                            <TrainFront size={24} />
                        </span>
                        <span>

                            <Navigation size={24} />
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-violet-100">
                        lorem....
                    </p>
                </div>
            </aside>

            <div className="flex w-full items-start lg:items-center justify-center bg-white rounded-t-2xl lg:rounded-none p-8 z-10">

                <form onSubmit={(e)=>{e.preventDefault(); handleSubmit();}} className="flex flex-col justify-center items-start gap-5">
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

                    <AppButton disabled={submitting} type='submit' className='w-full'>
                        {submitting ? 'Ingresando...' : 'Ingresar'}
                    </AppButton>
                    <AppButton disabled={submitting} type='button' appearance='subtle' onClick={() => navigate('/register')} className='-mt-2 w-full'>
                        Registrarse
                    </AppButton>

                    {error && (
                        <div className="rounded-md border border-red-700 bg-red-50 px-3 py-2">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}
                </form>

                {health && (
                    <p className="absolute bottom-0 left-0 p-4 text-sm text-gray-500">{health}</p>
                )}
            </div>
        </div>
    );
}

export default Login;

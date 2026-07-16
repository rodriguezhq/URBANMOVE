import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../Components/AuthCard';
import AuthInput from '../Components/AuthInput';
import AuthButton from '../Components/AuthButton';
import { useAuth } from '../Hooks/useAuth';
import { HealthCheckService } from '../services/HealthCheckService';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [health, setHealth] = useState('');

    const { Login } = useAuth();
    const navigate = useNavigate();

    const checkHealth = async () => {
        try {
            const ok = await HealthCheckService.Check();
            setHealth(ok ? 'API en línea' : '');
        } catch {
            setHealth('Error ');
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
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
        <div className="relative min-h-screen">
            <AuthCard title="Inicia sesión">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <AuthInput label="Correo" type="email" icon="email" value={email} onChange={setEmail} />
                    <AuthInput label="Contraseña" type="password" icon="password" value={password} onChange={setPassword} />

                    {error && (
                        <div className="border border-red-700 bg-red-50 px-3 py-2">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    <AuthButton disabled={submitting}>
                        {submitting ? 'Ingresando...' : 'Ingresar'}
                    </AuthButton>
                </form>
            </AuthCard>

            {health && (
                <p className="absolute bottom-0 left-0 p-4 text-sm text-gray-500">{health}</p>
            )}
        </div>
    );
}

export default Login;
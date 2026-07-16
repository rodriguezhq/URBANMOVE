import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../Components/AuthCard';
import AuthInput from '../Components/AuthInput';
import AuthButton from '../Components/AuthButton';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { Login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await Login({ email, password });
            navigate('/');
        } catch {
            setError('No vales');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthCard title="Login">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AuthInput label="" type="email" value={email} onChange={setEmail} />
                <AuthInput label="" type="password" value={password} onChange={setPassword} />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <AuthButton disabled={submitting}>
                    {submitting ? 'enviar' : 'enviar'}
                </AuthButton>
            </form>
        </AuthCard>
    );
}

export default Login;
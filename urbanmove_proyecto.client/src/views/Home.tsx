import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserBadge from '../Components/UserBadge';
import { useAuth } from '../Hooks/useAuth';

function Home() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    if (loading || !user) return null;
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
            <UserBadge fullName={user.fullName} email={user.email} />
            <button
                onClick={handleLogout}
                className="bg-black px-4 py-2 text-sm font-semibold text-white"
            >
                Cerrar sesion
            </button>
        </div>
    );
}

export default Home;
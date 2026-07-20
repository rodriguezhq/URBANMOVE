import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import { use, useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Bus, CheckIcon, HardHat, Home, Layout, LogOut, Menu, Send, SendHorizonal, Star, Ticket, User, Wallet } from 'lucide-react';
import AppButton from '../AppButton';
import { twMerge } from 'tailwind-merge';
import type { RolType, UserType } from '../../Types/authType';
import Spinner from '../Spinner';
import { AuthService } from '../../services/AuthService';

type RouteType = {
    url: string;
    icon: React.ReactNode;
    name: string;
}

const Routes = {
    ciudadano: [
        { url: '/app/navegar', icon: <SendHorizonal size={24} />, name: 'Navegar' },
        { url: '/app/tickets', icon: <Ticket size={24} />, name: 'Tickets' },
        { url: '/app/incidentes', icon: <AlertTriangle size={24} />, name: 'Incidentes' },
        { url: '/app/saldo', icon: <Wallet size={24} />, name: 'Saldo' },
        { url: '/app/puntos', icon: <Star size={24} />, name: 'Puntos' },
        { url: '/app/perfil', icon: <User size={24} />, name: 'Perfil' },
    ],
    operador: [
        { url: '/app/dashboard', icon: <Layout size={24} />, name: 'Dashboard' },
        { url: '/app/gestion-incidentes', icon: <AlertTriangle size={24} />, name: 'Incidentes' },
        { url: '/app/tickets', icon: <Ticket size={24} />, name: 'Tickets' },
        { url: '/app/unidades', icon: <Bus size={24} />, name: 'Unidades' },
        { url: '/app/perfil', icon: <User size={24} />, name: 'Perfil' },
    ],
    admin: [
        { url: '/app/dashboard', icon: <Layout size={24} />, name: 'Dashboard' },
        { url: '/app/gestion-incidentes', icon: <AlertTriangle size={24} />, name: 'Incidentes' },
        { url: '/app/operadores', icon: <HardHat size={24} />, name: 'Operadores' },
        { url: '/app/perfil', icon: <User size={24} />, name: 'Perfil' },
    ]
} satisfies Record<RolType, RouteType[]>

function MainLayout() {
    const [showSidebar, setShowSidebar] = useState(false);
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();


    const userRole = useMemo(() => user?.role || 'ciudadano', [user]);
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const renderRoutes = useMemo(() => {
        return Routes[userRole]?.map((route) => (
            <AppButton
                key={route.url}
                appearance='subtle'
                className='h-14 flex text-white w-full justify-start items-center gap-2 p-4'
                onClick={() => navigate(route.url)}
                title={route.name}
            >
                {route.icon}
                {showSidebar && <span className='tracking-wide'>{route.name}</span>}
            </AppButton>
        ));
    }, [userRole, showSidebar, navigate]);

    return (
        <div className='grid grid-cols-1 md:grid-cols-[auto_1fr] grid-rows-1 h-screen'>
            <aside
                className={twMerge(
                    'z-100 hidden h-screen grid-rows-[auto_1fr_auto] bg-violet-600 text-white md:relative md:grid md:translate-x-0 md:transition-[width] md:duration-200',
                    showSidebar ? 'md:w-75' : 'md:w-14',
                )}
            >
                <header className='flex flex-col items-center justify-center'>
                    <AppButton
                        appearance='subtle'
                        className='h-14 flex text-white w-full justify-start items-center gap-2 p-4'
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        <Menu size={24} />
                        {showSidebar && <span className='text-lg font-bold tracking-wide'>URBANMOVE</span>}
                    </AppButton>
                </header>
                <nav className='overflow-y-auto'>
                    {renderRoutes}
                </nav>
                <footer>
                    <AppButton
                        appearance='subtle'
                        disabled={loading}
                        onClick={handleLogout}
                        className='h-14 flex text-white w-full justify-start items-center gap-2 p-4'
                    >
                        <LogOut size={24} />
                        {showSidebar && <span className='tracking-wide'>Cerrar sesión</span>}
                    </AppButton>
                </footer>
            </aside>
            <aside
                className={twMerge(
                    'z-100 fixed inset-y-0 left-0 grid h-screen w-screen grid-rows-[auto_1fr_auto] bg-violet-600 text-white transition-transform duration-200 ease-out md:hidden',
                    showSidebar ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <header className='flex flex-col items-center justify-center'>
                    <AppButton
                        appearance='subtle'
                        className='h-14 flex text-white w-full justify-start items-center gap-2 p-4'
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        <Menu size={24} />
                        {showSidebar && <span className='text-lg font-bold tracking-wide'>URBANMOVE</span>}
                    </AppButton>
                </header>
                <nav className='overflow-y-auto'>
                    {renderRoutes}
                </nav>
                <footer>
                    <AppButton
                        appearance='subtle'
                        disabled={loading}
                        onClick={handleLogout}
                        className='h-14 flex text-white w-full justify-start items-center gap-2 p-4'
                    >
                        <LogOut size={24} />
                        {showSidebar && <span className='tracking-wide'>Cerrar sesión</span>}
                    </AppButton>
                </footer>
            </aside>
            <main className='overflow-y-auto overflow-x-hidden'>
                <header className='md:hidden w-full bg-violet-600 text-white p-1 flex justify-start gap-2 items-center'>
                    <AppButton
                        appearance='transparent'
                        className='md:hidden text-white'
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        <Menu size={32} />
                    </AppButton>
                    <h1 className="text-xl font-bold tracking-wide">URBANMOVE</h1>
                </header>

                <VerifyEmailCommponent user={user} />

                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;


interface VerifyEmailComponentProps {
    user: UserType | null;
}

const VerifyEmailCommponent = ({ user }: VerifyEmailComponentProps) => {
    const [state, setState] = useState<'idle' | 'error' | 'loading' | 'send'>('idle');

    if (!user || user.verifiedEmail) {
        return null;
    }

    const handleSendVerificationEmail = useCallback(async () => {
        setState('loading');
        try {
            await AuthService.sendVerificationEmail(user.email);
            setState('send');
        } catch (e) {
            console.error(e);
            setState('error');
        }
    }, [user]);


    return (
        <AppButton
            onClick={handleSendVerificationEmail}
            appearance='transparent'
            className={
                twMerge(
                    'w-full px-4 py-3 text-center flex gap-2 items-center justify-start text-sm sticky top-0 z-50',
                    state === 'idle' ? 'bg-yellow-100 text-yellow-800' : '',
                    state === 'loading' ? 'bg-blue-100 text-blue-800' : '',
                    state === 'error' ? 'bg-red-100 text-red-800' : '',
                    state === 'send' ? 'bg-green-100 text-green-800' : ''
                )
            }
            disabled={state === 'loading' || state === 'send'}
        >
            {
                state === 'idle'
                    ? (
                        <>
                            <AlertTriangle size={18} />
                            <p className='text-left hidden lg:block'>Su correo aun no ha sido verificado, algunas funcionalidades pueden estar limitadas.</p>
                            <p className='text-left font-bold'>Presione aquí para verificar su correo.</p>
                        </>
                    )
                    : state === 'loading'
                        ? (<>
                            <Spinner />
                            <p className='text-left'>Enviando correo de verificación...</p>
                        </>)
                        : state === 'error'
                            ? (<p className='text-left font-bold'>Ocurrió un error al enviar el correo de verificación, intente nuevamente.</p>)
                            : state === 'send'
                                ? (
                                    <>
                                        <CheckIcon size={18} />
                                        <p className='text-left font-bold'>Se ha enviado un correo de verificación a su correo electrónico.</p>
                                    </>
                                )
                                : null
            }

        </AppButton>
    )
}
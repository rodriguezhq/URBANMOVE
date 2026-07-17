import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import AppButton from '../AppButton';
import { twMerge } from 'tailwind-merge';

function MainLayout() {
    const [showSidebar, setShowSidebar] = useState(false);

    const { loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

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
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
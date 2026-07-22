import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../views/Login';
import MainLayout from '../Components/shared/MainLayout';
import ProtectedRoute from '../Components/ProtectedRoute';
import IndexLayout from '../Components/shared/IndexLayout';
import Register from '../views/Register';
import RecoverPasswordView from '../views/RecoverPasswordView';
import NavegarView from '../views/NavegarView';
import IncidentesView from '../views/IncidentesView';
import ResetPasswordView from '../views/ResetPasswordView';
import GestionIncidentesView from '../views/GestionIncidentesView';
import DashboardView from '../views/DashboardView';
import FidelizacionView from '../views/FidelizacionView';
import EmailVerificationScreen from '../services/EmailVerificationScreen';
import GestionComerciosView from '../views/GestionComerciosView';
import TicketsView from '../views/TicketsView';
import GestionRutasView from '../views/GestionRutasView';
import PerfilView from '../views/PerfilView';
import OperadoresView from '../views/OperadoresView';
import ValidarTicketsView from '../views/ValidarTicketsView';
import { useAuth } from '../Hooks/useAuth';

function HomeRedirect() {
    const { user } = useAuth();
    const role = user?.role || 'ciudadano';
    if (role === 'ciudadano')
        return <Navigate to="/app/navegar" replace />;
    return <Navigate to="/app/dashboard" replace />;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<IndexLayout />}>
                <Route index element={<Navigate to="/login" />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="recover-password" element={<RecoverPasswordView />} />
                <Route path='reset-password' element={<ResetPasswordView />} />
                <Route path='verify-email' element={<EmailVerificationScreen />} />
            </Route>
            <Route path="/app/*" element={
                <ProtectedRoute>
                    <ProtectedRoute.Branch value={['operador', 'admin']}>
                        <MainLayout />
                    </ProtectedRoute.Branch>
                    <ProtectedRoute.Branch value="ciudadano">
                        <MainLayout />
                    </ProtectedRoute.Branch>
                </ProtectedRoute>
            } >
                <Route path="" element={<HomeRedirect />} />
                <Route path="dashboard" element={<DashboardView />} />
                <Route path="navegar" element={<NavegarView />} />
                <Route path="tickets" element={<TicketsView />} />
                <Route path="incidentes" element={<IncidentesView />} />
                <Route path="gestion-incidentes" element={<GestionIncidentesView />} />
                <Route path="puntos" element={<FidelizacionView />} />
                <Route path="comercios" element={<GestionComerciosView />} />
                <Route path="rutas" element={<GestionRutasView />} />
                <Route path="operadores" element={<OperadoresView />} />
                <Route path="validar-tickets" element={<ValidarTicketsView />} />
                <Route path="perfil" element={<PerfilView />} />
            </Route>

        </Routes>
    )
}
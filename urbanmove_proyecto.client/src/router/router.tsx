import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../views/Login';
import MainLayout from '../Components/shared/MainLayout';
import ProtectedRoute from '../Components/ProtectedRoute';
import Home from '../views/Home';
import IndexLayout from '../Components/shared/IndexLayout';
import Register from '../views/Register';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<IndexLayout />}>
                <Route index element={<Navigate to="/login" />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
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
                <Route path="" element={<Home />} />
            </Route>
        </Routes>
    )
}
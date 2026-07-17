import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../views/Login';
import MainLayout from '../Components/shared/MainLayout';
import ProtectedRoute from '../Components/ProtectedRoute';
import Home from '../views/Home';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app/*" element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            } >
                <Route path="" element={<Home/>} />
            </Route>
        </Routes>
    )
}
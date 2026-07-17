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
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>
            <Route path="/app/*" element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            } >
                <Route path="" element={<Home />} />
            </Route>
        </Routes>
    )
}
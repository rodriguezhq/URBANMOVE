import { Route, Routes } from 'react-router-dom';
import Login from '../views/Login';
import Home from '../views/Home';
import ProtectedRoute from '../Components/ProtectedRoute';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
            } />
        </Routes>
    )
}
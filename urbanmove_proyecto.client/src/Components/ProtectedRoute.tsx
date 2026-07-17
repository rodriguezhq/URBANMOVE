import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user , loading} = useAuth();

    if (loading) {
        return null; // or a loading spinner
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
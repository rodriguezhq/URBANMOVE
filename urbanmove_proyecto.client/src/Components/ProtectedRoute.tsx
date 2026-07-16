import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import type { ReactNode } from "react";
interface ProtectedRouteProps {
    children: ReactNode;
}
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    console.log("ProtectedRoute user:", user);
    if (loading) {
        return null;
    }
    if (user) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}
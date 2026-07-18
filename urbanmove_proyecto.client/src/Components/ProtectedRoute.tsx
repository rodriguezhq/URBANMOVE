import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import type { ReactElement, ReactNode } from "react";
import type { RolType } from "../Types/authType";
import React from "react";

interface BranchProps {
    value: RolType | RolType[] | "";
    children: ReactNode;
}
function Branch({ children }: BranchProps) {
    return <>{children}</>;
}
interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // or a loading spinner
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    const branches = React.Children.toArray(children).filter(
        (child): child is ReactElement<BranchProps> =>
            React.isValidElement(child) && child.type === ProtectedRoute.Branch
    );
    const matchingBranch = branches.find((branch) => {
        const { value } = branch.props;
        if (value === "") return true; 
        if (Array.isArray(value)) return value.includes(user.role);
        return value === user.role;
    });
    return matchingBranch ? <>{matchingBranch.props.children}</> : null;
}
ProtectedRoute.Branch = Branch;
export default ProtectedRoute;
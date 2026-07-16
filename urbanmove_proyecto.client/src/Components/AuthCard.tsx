import type { ReactNode } from 'react';

interface AuthCardProps {
    title: string;
    children: ReactNode;
}

function AuthCard({ title, children }: AuthCardProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-50">
            <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-xl font-bold text-blue-950">{title}</h1>
                {children}
            </div>
        </div>
    );
}

export default AuthCard;
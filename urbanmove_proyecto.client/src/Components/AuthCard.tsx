import type { ReactNode } from 'react';

interface AuthCardProps {
    title: string;
    children: ReactNode;
}

function AuthCard({ title, children }: AuthCardProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm border border-gray-300 bg-white p-8">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    {title}
                </h1>
                {children}
            </div>
        </div>
    );
}

export default AuthCard;
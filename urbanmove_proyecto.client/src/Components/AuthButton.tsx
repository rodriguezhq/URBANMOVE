import type { ReactNode } from 'react';

interface AuthButtonProps {
    children: ReactNode;
    disabled?: boolean;
    type?: 'submit' | 'button';
    onClick?: () => void;
}

function AuthButton({ children, disabled, type = 'submit', onClick }: AuthButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className="w-full bg-black py-2 text-sm font-semibold
                       text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
            {children}
        </button>
    );
}

export default AuthButton;
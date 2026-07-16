import type { ReactNode } from 'react';

interface AuthButtonProps {
    children: ReactNode;
    disabled?: boolean;
    type?: 'submit' | 'button';
    onClick?: () => void;
}

function AuthButton({ children, disabled, type = 'submit'}: AuthButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled}
            className="w-full rounded-md border border-blue-950 bg-blue-950 py-2.5 text-sm font-bold
                       uppercase tracking-wide text-white
                       disabled:border-black disabled:bg-black"
        >
            {children}
        </button>
    );
}

export default AuthButton;
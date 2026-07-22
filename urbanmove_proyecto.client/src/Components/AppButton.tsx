import { cva } from 'class-variance-authority';
import type { Appearance } from '../Types/styleTypes';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes } from 'react';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    appearance?: Appearance
}

const buttonVariants = cva(
    ["px-3 py-2 rounded-none transition-colors duration-200 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"],
    {
        variants: {
            appearance: {
                filled: "border-transparent bg-blue-800 text-white hover:bg-blue-700",
                outline: "border-blue-800 text-blue-800 hover:bg-blue-100/50",
                subtle: "bg-transparent text-blue-800 hover:bg-neutral-300/10 border-transparent",
                transparent: "bg-transparent text-blue-800 border-transparent",
            } satisfies Record<Appearance, string>
        }
    }
)



export default function AppButton({ children, disabled, type = 'button', className, ...props }: AppButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={
                twMerge(
                    buttonVariants({
                        appearance: props.appearance ?? 'filled'
                    }),
                    className
                )
            }
            {...props}
        >
            {children}
        </button>
    );
}
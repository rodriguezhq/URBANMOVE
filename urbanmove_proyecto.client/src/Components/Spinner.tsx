import { twMerge } from "tailwind-merge";

interface SpinnerProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export default function Spinner({ size = 24, strokeWidth = 4, className = '' }: SpinnerProps) {
    return (
        <span className={twMerge("inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="spinner-rotate"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={(size - strokeWidth) / 2}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="spinner-dash"
                />
            </svg>
        </span>
    )
}
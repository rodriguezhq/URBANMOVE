interface SkeletonProps {
    className?: string;
    children?: React.ReactNode;
}

export default function Skeleton({ className = '', children }: SkeletonProps) {
    return (
        <div className={`animate-shimmer bg-gray-300 rounded-md ${className}`}>
            {children}
        </div>
    )
}
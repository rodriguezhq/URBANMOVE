interface UserBadgeProps {
    fullName: string;
    email: string;
}

function UserBadge({ fullName, email }: UserBadgeProps) {
    return (
        <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold text-gray-900">
                Ingersaste , {fullName}
            </h1>
            <p className="text-sm text-gray-600">{email}</p>
        </div>
    );
}

export default UserBadge;
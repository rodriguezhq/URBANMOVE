interface AuthInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
}

function AuthInput({ label, type, value, onChange }: AuthInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
                className="border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

export default AuthInput;
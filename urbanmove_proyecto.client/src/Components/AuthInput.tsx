import { Mail, Lock } from 'lucide-react';

interface AuthInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    icon?: 'email' | 'password';
}

function AuthInput({ label, type, value, onChange, icon }: AuthInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide text-blue-950">
                {label}
            </label>
            <div className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-md border border-gray-300 bg-white px-3">
                {icon === 'email' && <Mail className="text-blue-900" size={18} />}
                {icon === 'password' && <Lock className="text-blue-900" size={18} />}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    className="w-full bg-transparent py-2 text-sm text-blue-950
                               focus:outline-none"
                />
            </div>
        </div>
    );
}

export default AuthInput;
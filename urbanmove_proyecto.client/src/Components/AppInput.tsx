import { cva } from "class-variance-authority";
import type { Appearance } from "../Types/styleTypes";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    value: string;
    appearance?: Appearance;
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
    containerClassName?: string;
}

const AppInnputVariante = cva(
    ["grid grid-cols-[auto_1fr_auto] border items-center gap-2 text-blue-950",],
    {
        variants: {
            appearance: {
                outline: "border border-gray-300 bg-white",
                filled: "border-transparent bg-gray-100",
                subtle: "border-transparent hover:bg-gray-100 focus-within:bg-gray-100",
                transparent: "border-transparent bg-transparent",
            } satisfies Record<Appearance, string>,
        }
    }
)

export default function AppInput({ label, type, value, onChange, appearance = 'outline', leading, trailing, className, containerClassName, ...props }: InputProps) {
    return (
        <label className={
            twMerge(
                "flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-blue-950",
                containerClassName
            )
        }>
            {label}
            <div className={
                twMerge(
                    AppInnputVariante({
                        appearance,
                    }),
                    className,
                    leading && "pl-2",
                    trailing && "pr-2"
                )
            }>
                {leading}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent py-2.5 text-sm font-normal
                    focus:outline-none"
                    {...props}
                />
                {trailing}
            </div>
        </label>
    );
}


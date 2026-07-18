import { Link, type LinkProps } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import type { Appearance } from "../Types/styleTypes";
import { cva } from "class-variance-authority";

const appLinkVariants = cva(
    ["px-3 py-2 rounded-none transition-colors duration-200 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"],
    {
        variants: {
            appearance: {
                filled: "border-transparent bg-blue-800 text-white hover:bg-blue-700",
                outline: "border-blue-800 text-blue-800 hover:bg-blue-100/50",
                subtle: "bg-transparent text-blue-800 hover:bg-neutral-300/10 border-transparent",
                transparent: "bg-transparent text-blue-800 border-transparent hover:underline",
            } satisfies Record<Appearance, string>
        }
    }
)

interface AppLinkProps extends LinkProps {
    appearance?: Appearance
    disabled?: boolean
}
function AppLink({ appearance = "filled", disabled = false, className, children, ...props }: AppLinkProps) {
    return (
        <Link
            className={twMerge(appLinkVariants({ appearance, }), className, disabled && "opacity-50 cursor-not-allowed")}
            {...props}
        >
            {children}
        </Link>
    )
}

export default AppLink;
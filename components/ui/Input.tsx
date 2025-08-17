import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string
    label: string
    error?: boolean
}

export const Input: React.FC<InputProps> = ({ value, label, className, placeholder, error, ...props }) => {
    return (
        <div className="w-full max-w-sm min-w-[200px] mx-auto">
            <div className="relative">
                <input
                    id={label}
                    value={value}
                    className={cn("peer w-full bg-[#000000] placeholder:text-white-400 text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm sm:bg-transparent focus:shadow", className, error ? "border-red-200" : "border-slate-200")}
                    {...props}
                />
                <label htmlFor={label} className={cn("absolute rounded-sm cursor-text bg-[#000000] px-1 left-2.5 top-2.5 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90", error && "!text-red-500", value && "!-top-2 !left-2.5 !text-xs text-slate-400 !scale-90")}>
                    {placeholder}{error && " *"}
                </label>
            </div>
        </div>
    )
}

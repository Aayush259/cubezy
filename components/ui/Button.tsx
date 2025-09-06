"use client"
import { cn } from "@/lib/utils"

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
    return (
        <button
            className={cn("bg-blue-700 rounded-md outline-none w-fit px-4 py-1.5 md:text-lg cursor-pointer hover:opacity-80 duration-200", className)}
            {...props}
        >
            {children}
        </button>
    )
}

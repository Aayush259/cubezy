"use client"
import { cn } from "@/lib/utils"
import Link from "next/link"

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

export const ButtonLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ href, children, className, ...props }) => {
    return (
        <Link href={href as string} className={cn("bg-blue-700 rounded-md outline-none w-fit px-4 py-1.5 md:text-lg cursor-pointer hover:opacity-80 duration-200", className)} {...props}>
            {children}
        </Link>
    )
}
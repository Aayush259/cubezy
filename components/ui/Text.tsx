"use client"
import { cn } from "@/lib/utils"

export const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
    return (
        <h1 className={cn("text-4xl md:text-5xl leading-[1.4] tracking-wide font-bold", className)} {...props}>
            {children}
        </h1>
    )
}

export const P: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
    return (
        <p className={cn("text-lg text-gray-300 max-w-[85%] leading-[1.8] tracking-wide", className)} {...props}>
            {children}
        </p>
    )
}

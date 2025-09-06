"use client"
import { cn } from "@/lib/utils"

export const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
    return (
        <h1 className={cn("text-3xl md:text-5xl leading-[1.4] tracking-wide font-bold", className)} {...props}>
            {children}
        </h1>
    )
}

export const H2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
    return (
        <h2 className={cn("text-2xl md:text-4xl font-bold", className)} {...props}>
            {children}
        </h2>
    )
}

export const P: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
    return (
        <p className={cn("md:text-lg text-gray-300 leading-[1.8] tracking-wide", className)} {...props}>
            {children}
        </p>
    )
}

export const P2: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
    return (
        <p className={cn("text-lg md:text-2xl font-semibold", className)} {...props}>
            {children}
        </p>
    )
}

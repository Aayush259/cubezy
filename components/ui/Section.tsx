"use client"
import { H2, P } from "./Text"
import { cn } from "@/lib/utils"

interface SectionProps {
    title: string
    subtitle: string
    className?: string
    children?: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ subtitle, title, className, children }) => {
    return (
        <section className={cn("py-5 md:py-10", className)}>
            <H2 className="text-center max-w-[97vw] mx-auto">{title}</H2>
            <P className="text-center my-4 max-w-[98%] md:max-w-[40%] mx-auto">{subtitle}</P>
            {children}
        </section>
    )
}

export default Section
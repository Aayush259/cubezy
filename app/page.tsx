import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Cubezy",
    description: "Cubezy - A modern and intuitive chat application for seamless communication and connection."
}

export default function Home() {
    return (
        <div className="h-screen flex flex-row overflow-hidden font-[family-name:var(--font-geist-sans)] select-none">
            Landing
        </div>
    )
}
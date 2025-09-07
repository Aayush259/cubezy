"use client"
import Link from "next/link"
import Image from "next/image"
import { navLinks } from "@/lib/data"
import { Button } from "../ui/Button"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RootState } from "@/lib/store/store"

const Header = () => {
    const router = useRouter()
    const [hamActive, setHamActive] = useState<boolean>(false)
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)

    useEffect(() => {
        const handleDocumentClick = () => {
            if (hamActive) setHamActive(false)
        }

        document.addEventListener('click', handleDocumentClick)

        return () => {
            document.removeEventListener('click', handleDocumentClick)
        }
    }, [hamActive])

    return (
        <header className="w-full sticky top-0 left-0 px-3 md:px-10 py-4 border-b border-gray-800 backdrop-blur-lg z-50">
            <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-1 md:gap-2 text-xl md:text-3xl font-semibold system-font">
                    <Image src="/icons/logo.png" alt="Cubezy" width={56} height={56} className="!w-10 md:!w-14 !h-auto" />
                    {"Cubezy"}
                </Link>

                <div className="absolute top-[73px] md:top-[90px] lg:static flex flex-col w-screen lg:w-fit lg:flex-row items-center lg:gap-8 text-xl duration-400 z-50 bg-black/80 lg:bg-transparent" style={{ left: hamActive ? "0" : "-100%" }}>
                    {navLinks.map((link, idx) => (
                        <Link href={link.href} key={idx} className="hover:opacity-80 px-8 lg:px-0 py-4 lg:py-0 duration-200 w-full lg:w-fit text-center">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn && user ? (
                        <Button onClick={() => router.push("/chat")}>{"Go to Chat"}</Button>
                    ) : (
                        <div className="flex items-center gap-2 md:gap-4">
                            <Button onClick={() => router.push("/login")}>{"Login"}</Button>
                            <Button onClick={() => router.push("/signup")}>
                                <span>{"Get started "}</span><span className="hidden lg:inline">{"for free"}</span>
                            </Button>
                        </div>
                    )}
                    <button
                        className="z-30 h-full flex flex-col items-center justify-center sm:hover:opacity-75 lg:hidden duration-300"
                        onClick={() => setHamActive(!hamActive)}
                    >
                        <div
                            className={`w-6 h-[2px] bg-white rounded duration-300 ${hamActive ? "rotate-45 translate-y-2" : ""}`}
                        ></div>
                        <div
                            className={`w-6 h-[2px] my-[4px] bg-white rounded duration-300 ${hamActive ? "opacity-0" : ""}`}
                        ></div>
                        <div
                            className={`w-6 h-[2px] bg-white rounded duration-300 ${hamActive ? "-rotate-45 -translate-y-[4px]" : ""}`}
                        ></div>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header

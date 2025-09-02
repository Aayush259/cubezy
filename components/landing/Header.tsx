"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "../ui/Button"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { RootState } from "@/lib/store/store"
import { navLinks } from "@/lib/data"

const Header = () => {
    const router = useRouter()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)

    return (
        <header className="w-full sticky top-0 left-0 px-3 md:px-10 py-4 border-b border-gray-800 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 text-3xl font-semibold system-font">
                    <Image src="/icons/logo.png" alt="Cubezy" width={56} height={56} className="!w-14 !h-auto" />
                    {"Cubezy"}
                </Link>

                <div className="flex items-center gap-8 text-xl">
                    {navLinks.map((link, idx) => (
                        <Link href={link.href} key={idx} className="hover:opacity-80 duration-200">
                            {link.label}
                        </Link>
                    ))}
                </div>

                {isLoggedIn && user ? (
                    <Button onClick={() => router.push("/chat")}>{"Go to Chat"}</Button>
                ) : (
                    <div className="flex items-center gap-4">
                        <Button className="bg-transparent" onClick={() => router.push("/login")}>{"Login"}</Button>
                        <Button onClick={() => router.push("/signup")}>{"Get started for free"}</Button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header

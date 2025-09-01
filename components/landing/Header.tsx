"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "../ui/Button"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { RootState } from "@/lib/store/store"

const Header = () => {
    const router = useRouter()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)

    return (
        <header className="w-full sticky top-0 left-0 px-3 md:px-10 py-4">
            <div className="max-w-[2000px] mx-auto flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 text-3xl font-semibold system-font">
                    <Image src="/icons/logo.png" alt="Cubezy" width={56} height={56} className="!w-14 !h-auto" />
                    {"Cubezy"}
                </Link>

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

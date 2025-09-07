"use client"
import Link from "next/link"
import { H2, P } from "../ui/Text"
import { Button } from "../ui/Button"
import { MdMail } from "react-icons/md"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { RootState } from "@/lib/store/store"

const Footer = () => {
    const router = useRouter()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)

    return (
        <footer className="pt-5 md:pt-30 relative max-w-screen overflow-hidden">
            <div className="absolute top-10 -right-0 rotate-6 w-[200%] h-[200%] bg-[linear-gradient(180deg,#27272a,#18181b)] z-20" />
            <div className="absolute top-10 -left-0 -rotate-6 w-[200%] h-[200%] bg-[#008EFF33] z-10" />

            <div className="relative z-30">
                <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
                    <H2 className="mb-8 leading-[1.5]">
                        {"Ready to Elevate Your Team's Communication and Productivity?"}
                    </H2>

                    {isLoggedIn && user ? (
                        <Button onClick={() => router.push("/chat")}>
                            {"Go to chat"}
                        </Button>
                    ) : (
                        <Button onClick={() => router.push("/login")}>
                            {"Get started"}
                        </Button>
                    )}
                </div>

                <div className="relative border-t border-gray-600">
                    <div className="mx-auto w-fit sm:w-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between px-2 sm:px-6 py-6">
                        <P className="text-sm">{"Copyright "}&copy;{" 2025"}</P>
                        <div className="flex items-center gap-4 text-sm sm:text-base sm:gap-6 mt-5 sm:mt-0">
                            <Link href="mailto:info@cubezy.in" className="flex items-center gap-2 link text-center" target="_blank" rel="noopener noreferrer">
                                <MdMail size={20} />
                                <span>{"info@cubezy.in"}</span>
                            </Link>

                            <Link href="/privacy-policy" className="link text-center">
                                {"Privacy Policy"}
                            </Link>
                            <Link href="/terms" className="link text-center">
                                {"Terms & Conditions"}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import SignupForm from "@/components/forms/SignupForm"

export const metadata: Metadata = {
    title: "Cubezy - Signup",
    description: "Join Cubezy today to experience a modern and intuitive chat application for connecting with friends and family."
}

export default async function SignupPage() {
    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-black">
            <div className="w-[800px] flex flex-col sm:flex-row items-center justify-center rounded-xl max-w-[95vw] overflow-hidden">
                <Image
                    src="/images/signup-side.svg"
                    width={300}
                    height={300}
                    alt="Signup now"
                    priority
                    className="fixed opacity-30 sm:opacity-100 backdrop-blur-sm sm:backdrop-blur-0 w-full h-full object-cover sm:static sm:w-[44%]"
                />

                <div className="w-full sm:w-[56%] p-4 sm:p-10 relative">
                    <SignupForm />

                    <p className="text-lg my-10 text-center">
                        {"Already have an account? "}
                        <Link href="/login" className="text-blue-500">{"Login"}</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
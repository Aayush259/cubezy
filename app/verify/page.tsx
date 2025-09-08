import Image from "next/image"
import { Metadata } from "next"
import OTPForm from "@/components/forms/OTPForm"

export const metadata: Metadata = {
    title: "Verify",
    description: "Verify your account to start using Cubezy",
}

export default async function VerifyPage() {
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
                    <OTPForm />
                </div>
            </div>
        </div>
    )
}
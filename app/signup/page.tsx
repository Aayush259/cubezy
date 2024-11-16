import SignupForm from "@/src/components/SignupForm";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {

    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-black">
            <div className="w-[800px] flex flex-row items-center justify-center rounded-xl max-w-[95vw] overflow-hidden">
                <Image
                    src="/images/signup-side.svg"
                    width={300}
                    height={300}
                    alt="Signup now"
                    className="md:w-[44%]"
                />

                <div className="w-[56%] p-10 relative">
                    <SignupForm />

                    <p className="text-lg my-10 text-center">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-500">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

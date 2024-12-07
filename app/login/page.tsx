import LoginForm from "@/src/components/LoginForm";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {

    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-black">
            <div className="w-[800px] flex flex-col sm:flex-row items-center justify-center rounded-xl max-w-[95vw] overflow-hidden">
                <Image
                    src="/images/signup-side.svg"
                    width={300}
                    height={300}
                    alt="Signup now"
                    priority
                    className="fixed opacity-30 sm:opacity-100 backdrop-blur-sm sm:backdrop-blur-0 sm:blur-0 blur-sm w-full h-full object-cover sm:static sm:w-[44%]"
                />

                <div className="w-full sm:w-[56%] p-4 sm:p-10 relative">
                    <LoginForm />

                    <p className="text-lg my-10 text-center">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-500">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

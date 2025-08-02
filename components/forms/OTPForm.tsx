"use client"
import Loader from "../common/Loader"
import requests from "@/lib/requests"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RootState } from "@/lib/store/store"
import { useToast } from "../context/ToastContext"
import { login } from "@/lib/store/features/userSlice"
import { useDispatch, useSelector } from "react-redux"
import { setOtp, setPassword } from "@/lib/store/features/authSlice"

export default function OTPForm() {
    const { addToast } = useToast()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)
    const { email, otp, password } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        if ((isLoggedIn && user) || !email.trim()) {
            router.push("/")
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!email.trim() || !otp?.trim() || !password.trim()) {
            setError(true)
            setIsSubmitting(false)
            return
        }
        setError(false)
        setIsSubmitting(true)

        try {
            const user = await requests.verifyOTP({ email, otp, password })
            dispatch(login(user))
            setPassword("")
            setOtp("")
        } catch (error) {
            console.error("Login failed:", error)
            addToast("Invalid credentials", false)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoggedIn && user) return (
        <div className="w-full h-full">
            <Loader />
        </div>
    )

    return (
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            <label htmlFor="otp" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>{"OTP:"}</span>
                    {error && !email.trim() && <span className="text-sm text-red-500 font-semibold">{"Required*"}</span>}
                </p>
                <input
                    type="text"
                    id="otp"
                    placeholder="Enter your otp"
                    className="w-full px-4 py-2 bg-transparent border border-white/80 rounded-lg"
                    value={otp || ""}
                    onChange={(e) => dispatch(setOtp(e.target.value))}
                />
            </label>

            <button type="submit" className={`px-4 py-2 my-2 w-full bg-blue-700 rounded-lg mx-auto ${isSubmitting ? "opacity-50" : "opacity-100"}`}>
                {"Verify"}
            </button>
        </form>
    )
}
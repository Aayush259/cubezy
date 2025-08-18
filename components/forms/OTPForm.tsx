"use client"
import Loader from "../common/Loader"
import requests from "@/lib/services/requests"
import OTPInput from "../ui/OTPInput"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RootState } from "@/lib/store/store"
import { useToast } from "../context/ToastContext"
import { login } from "@/lib/store/features/userSlice"
import { useDispatch, useSelector } from "react-redux"
import { setPassword } from "@/lib/store/features/authSlice"

export default function OTPForm() {
    const { addToast } = useToast()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)
    const { email, password } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        if ((isLoggedIn && user) || !email.trim()) {
            router.push("/")
        }
    }, [])

    const handleSubmit = async (otp: string) => {
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
        <form className="w-full flex flex-col gap-6">
            <label htmlFor="otp" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>{"OTP"}</span>
                    {error && <span className="text-sm text-red-500 font-semibold">{"Invalid OTP*"}</span>}
                </p>

                <OTPInput length={6} onOtpSubmit={handleSubmit} disabled={isSubmitting} />
            </label>
        </form>
    )
}
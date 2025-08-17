"use client"
import env from "@/config/envConf"
import { Input } from "../ui/Input"
import Loader from "../common/Loader"
import requests from "@/lib/requests"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RootState } from "@/lib/store/store"
import ReCAPTCHA from "react-google-recaptcha"
import { useToast } from "../context/ToastContext"
import { useDispatch, useSelector } from "react-redux"
import { setEmail, setName, setPassword } from "@/lib/store/features/authSlice"

export default function SignupForm() {
    const dispatch = useDispatch()
    const { addToast } = useToast()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)
    const { email, password, name } = useSelector((state: RootState) => state.auth)
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        if (isLoggedIn && user) {
            router.push("/")
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (!name?.trim() || !email.trim() || !password.trim() || !captchaToken) {
            setError(true)
            setIsSubmitting(false)
            return
        }

        try {
            const { redirect } = await requests.signup({ name, email, password, captchaToken })
            console.log("PUSHING TO", redirect)
            router.push(redirect)
        } catch {
            addToast("Something went wrong", false)
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
            <Input
                type="text"
                id="name"
                label="Name"
                placeholder="Name"
                value={name || ""}
                onChange={(e) => dispatch(setName(e.target.value))}
                error={error && !name?.trim()}
            />

            <Input
                type="email"
                id="email"
                label="Email"
                placeholder="Email"
                value={email || ""}
                onChange={(e) => dispatch(setEmail(e.target.value))}
                error={error && !email?.trim()}
            />

            <Input
                type="password"
                id="password"
                label="Password"
                placeholder="Password"
                value={password || ""}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                error={error && !password?.trim()}
            />

            <ReCAPTCHA
                sitekey={env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                className="mx-auto"
            />

            <button type="submit" className={`px-4 py-2 my-2 w-full max-w-sm bg-orange-700 rounded-lg mx-auto ${isSubmitting ? "opacity-50" : "opacity-100"}`}>
                {"Sign Up"}
            </button>
        </form>
    )
}
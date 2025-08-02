"use client"
import Loader from "../common/Loader"
import requests from "@/lib/requests"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RootState } from "@/lib/store/store"
import { useToast } from "../context/ToastContext"
import { login } from "@/lib/store/features/userSlice"
import { useDispatch, useSelector } from "react-redux"
import { setEmail, setPassword } from "@/lib/store/features/authSlice"

export default function LoginForm() {
    const { addToast } = useToast()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)
    const { email, password } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        if (isLoggedIn && user) {
            router.push("/")
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!email.trim() || !password.trim()) {
            setError(true)
            setIsSubmitting(false)
            return
        }
        setError(false)
        setIsSubmitting(true)

        try {
            const loginResponse = await requests.login({ email, password })
            if ("redirect" in loginResponse) {
                router.push(loginResponse?.redirect)
            } else {
                dispatch(login(loginResponse))
            }
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
            <label htmlFor="email" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>{"Email:"}</span>
                    {error && !email.trim() && <span className="text-sm text-red-500 font-semibold">{"Required*"}</span>}
                </p>
                <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-transparent border border-white/80 rounded-lg"
                    value={email}
                    onChange={(e) => dispatch(setEmail(e.target.value))}
                />
            </label>

            <label htmlFor="name" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>{"Password:"}</span>
                    {error && !password.trim() && <span className="text-sm text-red-500 font-semibold">{"Required*"}</span>}
                </p>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-transparent border border-white/80 rounded-lg"
                    value={password}
                    onChange={(e) => dispatch(setPassword(e.target.value))}
                />
            </label>

            <button type="submit" className={`px-4 py-2 my-2 w-full bg-blue-700 rounded-lg mx-auto ${isSubmitting ? "opacity-50" : "opacity-100"}`}>
                {"Sign In"}
            </button>
        </form>
    )
}
"use client"
import Loader from "../common/Loader"
import requests from "@/lib/requests"
import { useEffect, useState } from "react"
import { RootState } from "@/lib/store/store"
import { useDispatch, useSelector } from "react-redux"
import { usePathname, useRouter } from "next/navigation"
import { login, logout } from "@/lib/store/features/userSlice"

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const getUser = async () => {
        try {
            const user = await requests.getMe()
            dispatch(login(user))
            setIsAuthenticated(true)
            router.push("/")
        } catch {
            dispatch(logout())
            if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/verify") {
                router.push("/login")
            }
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getUser()
    }, [isLoggedIn])

    if (loading) {
        return (
            <div className="w-screen h-screen">
                <Loader />
            </div>
        )
    }

    if (!isAuthenticated && pathname !== "/signup" && pathname !== "/login" && pathname !== "/verify") {
        return null
    }

    return children
}

export default AuthProvider
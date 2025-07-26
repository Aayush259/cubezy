"use client"
import Toast from "../common/Toast"
import { IToast } from "@/lib/interfaces"
import { createContext, useContext, useState } from "react"

interface IToastContext {
    addToast: (message: string, success: boolean) => void
}

const ToastContext = createContext<IToastContext | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<IToast[]>([])

    const addToast = (message: string, success: boolean) => {
        const id = Math.random().toString(36).slice(2, 11)
        setToasts((prevToasts) => [...prevToasts, { id, message, success }])
    }

    const removeToast = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            <div className="w-screen fixed top-5 left-0 z-[999] flex flex-col duration-500 h-fit items-center">
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} success={toast.success} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
            {children}
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}
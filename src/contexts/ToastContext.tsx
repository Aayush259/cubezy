"use client";
import { createContext, useContext, useState } from "react";
import { IToast } from "@/utils/interfaces/interfaces";
import Toast from "../components/Toast";

const ToastContext = createContext<{
    addToast: (message: string, success: boolean) => void;
}>({
    addToast: () => { },
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<IToast[]>([]);

    const addToast = (message: string, success: boolean) => {
        const id = Math.random().toString(36).slice(2, 11);
        setToasts((prevToasts) => [...prevToasts, { id, message, success }]);
    };

    const removeToast = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            <div className="w-screen fixed top-5 left-0 z-50 flex flex-col duration-500 h-fit items-center">
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} success={toast.success} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import AuthProvider from "@/components/providers/AuthProvider"
import StoreProvider from "@/components/providers/StoreProvider"
import { ToastProvider } from "@/components/context/ToastContext"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ToastProvider>
                    <StoreProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </StoreProvider>
                </ToastProvider>
            </body>
        </html>
    )
}

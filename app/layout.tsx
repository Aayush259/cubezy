import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import AuthProvider from "@/components/providers/AuthProvider"
import StoreProvider from "@/components/providers/StoreProvider"
import { ToastProvider } from "@/components/context/ToastContext"
import { ChatContextProvider } from "@/components/context/ChatContext"
import { ProfileContextProvider } from "@/components/context/ProfileContext"
import { Metadata } from "next"
import env from "@/config/envConf"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: {
        default: "Cubezy",
        template: "%s | Cubezy"
    },
    description: "Cubezy - Secure team communication and task management platform. Real-time messaging, project tracking, and end-to-end encryption for modern teams and businesses.",
    metadataBase: new URL(env.APP_URL),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ToastProvider>
                    <StoreProvider>
                        <AuthProvider>
                            <ChatContextProvider>
                                <ProfileContextProvider>
                                    {children}
                                </ProfileContextProvider>
                            </ChatContextProvider>
                        </AuthProvider>
                    </StoreProvider>
                </ToastProvider>
            </body>
        </html>
    )
}

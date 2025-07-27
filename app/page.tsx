import { Metadata } from "next"
import IdBar from "@/components/chat/IdBar"
import Sidebar from "@/components/chat/Sidebar"
import Profile from "@/components/chat/Profile"
import ChatWindow from "@/components/chat/ChatWindow"
import { ChatContextProvider } from "@/components/context/ChatContext"
import { IdBarContextProvider } from "@/components/context/IdBarContext"
import DeleteMessageWindow from "@/components/dialogs/DeleteMessageWindow"
import ForwardMessageWindow from "@/components/dialogs/ForwardMessageWindow"
import { ProfileContextProvider } from "@/components/context/ProfileContext"

export const metadata: Metadata = {
    title: "Cubezy",
    description: "Cubezy - A modern and intuitive chat application for seamless communication and connection."
}

export default function Home() {
    return (
        <div className="h-screen flex flex-row overflow-hidden font-[family-name:var(--font-geist-sans)] select-none">
            <ChatContextProvider>
                <ProfileContextProvider>
                    <IdBarContextProvider>
                        <Sidebar />
                        <IdBar />
                    </IdBarContextProvider>

                    <div className="h-full flex-grow relative">
                        <ChatWindow />
                        <ForwardMessageWindow />
                        <DeleteMessageWindow />
                        <Profile />
                    </div>
                </ProfileContextProvider>
            </ChatContextProvider>
        </div>
    )
}
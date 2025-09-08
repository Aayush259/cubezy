import { Metadata } from "next"
import IdBar from "@/components/chat/IdBar"
import Sidebar from "@/components/chat/Sidebar"
import Profile from "@/components/chat/Profile"
import ChatWindow from "@/components/chat/ChatWindow"
import { IdBarContextProvider } from "@/components/context/IdBarContext"
import DeleteMessageWindow from "@/components/dialogs/DeleteMessageWindow"
import ForwardMessageWindow from "@/components/dialogs/ForwardMessageWindow"

export const metadata: Metadata = {
    title: "Chat",
}

export default function Home() {
    return (
        <div className="h-screen flex flex-row overflow-hidden font-[family-name:var(--font-geist-sans)] select-none">
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
        </div>
    )
}
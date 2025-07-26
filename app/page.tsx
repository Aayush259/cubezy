// import Image from "next/image"
import { Metadata } from "next"
import IdBar from "@/components/chat/IdBar"
import Sidebar from "@/components/chat/Sidebar"
import Profile from "@/components/chat/Profile"
import ChatWindow from "@/components/chat/ChatWindow"
import { ChatContextProvider } from "@/components/context/ChatContext"
import { IdBarContextProvider } from "@/components/context/IdBarContext"
import ForwardMessageWindow from "@/components/dialogs/ForwardMessageWindow"
import { ProfileContextProvider } from "@/components/context/ProfileContext"
import DeleteMessageWindow from "@/components/dialogs/DeleteMessageWindow"

export const metadata: Metadata = {
    title: "Square",
    description: "Square - A modern and intuitive chat application for seamless communication and connection."
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
                        {/* <Image
                            src="/images/chat_window_bg.webp"
                            height={4160}
                            width={6240}
                            alt="Chat Window Background"
                            className="object-cover object-center absolute z-10 top-0 left-0 opacity-10 w-full h-full"
                        /> */}
                        <ChatWindow />
                        <ForwardMessageWindow />
                        <DeleteMessageWindow />
                        <Profile />
                    </div>
                </ProfileContextProvider>
            </ChatContextProvider>

            {/* <button onClick={sendMessage}>Send</button> */}
        </div>
    )
}
"use client";
import Sidebar from "@/src/components/Sidebar";
import IdBar from "@/src/components/IdBar";
import { IdBarContextProvider } from "@/src/contexts/IdBarContext";
import { ChatContextProvider } from "@/src/contexts/ChatContext";
import ChatWindow from "@/src/components/ChatWindow";
import Image from "next/image";
import Profile from "@/src/components/Profile";
import { ProfileContextProvider } from "@/src/contexts/ProfileContext";

export default function Home() {

  return (
    <div className="h-screen flex flex-row overflow-hidden font-[family-name:var(--font-geist-sans)]">
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

            <Profile />
          </div>
        </ProfileContextProvider>
      </ChatContextProvider>

      {/* <button onClick={sendMessage}>Send</button> */}
    </div>
  );
}

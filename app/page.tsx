"use client";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import Sidebar from "@/src/components/Sidebar";
import IdBar from "@/src/components/IdBar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { updateConnections } from "@/src/store/userSlice";
import { IdBarContextProvider } from "@/src/contexts/IdBarContext";
import { ChatContextProvider, useChatContext } from "@/src/contexts/ChatContext";
import ChatWindow from "@/src/components/ChatWindow";
import Image from "next/image";

const SOCKET_PATH = "/api/socket/connect"

export default function Home() {

  const { user } = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();
  // const 
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("Hii");

  useEffect(() => {
    // Connect to the backend Socket.IO server.
    const newSocket = io("http://localhost:3000", {
      path: SOCKET_PATH,
      auth: {
        token: localStorage.getItem("token"),
      }
    });

    // Listen for incoming messages.
    newSocket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("connectionUpdated", (newConnection) => {
      if (user?.connections) {
        const updatedConnectionsArray = [...user?.connections, newConnection];
        dispatch(updateConnections(updatedConnectionsArray));
      }
    });

    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts.
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex flex-row overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <ChatContextProvider>
        <IdBarContextProvider>
          <Sidebar />
          <IdBar />
        </IdBarContextProvider>

        <div className="h-full flex-grow relative">
          <Image
            src="/images/chat_window_bg.webp"
            height={4160}
            width={6240}
            alt="Chat Window Background"
            className="object-cover object-center absolute z-10 top-0 left-0 opacity-10 w-full h-full"
          />
          <ChatWindow />
        </div>
      </ChatContextProvider>

      {/* <button onClick={sendMessage}>Send</button> */}
    </div>
  );
}

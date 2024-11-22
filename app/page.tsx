"use client";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

const SOCKET_PATH = "/api/socket/connect"

export default function Home() {

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      Page

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

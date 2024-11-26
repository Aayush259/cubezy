"use client";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import Sidebar from "@/src/components/Sidebar";
import IdBar from "@/src/components/IdBar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { updateConnections } from "@/src/store/userSlice";
import { IdBarContextProvider } from "@/src/contexts/IdBarContext";

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
      <IdBarContextProvider>
        <Sidebar />
        <IdBar />
      </IdBarContextProvider>

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

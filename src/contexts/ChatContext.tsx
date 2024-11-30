import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { io, Socket } from "socket.io-client";
import { updateConnections } from "../store/userSlice";

const SOCKET_PATH = "/api/socket/connect"

const ChatContext = createContext<{
    receiverId: string | null;
    setReceiverId: (id: string) => void;
    chats: {
        _id: string;
        senderId: string;
        message: string;
        sentAt: Date;
        isRead: boolean;
    }[] | null;
    loadingChats: boolean;
    socket: Socket | null;
}>({
    receiverId: null,
    setReceiverId: (id: string) => { },
    chats: null,
    loadingChats: false,
    socket: null
})

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const dispatch = useDispatch();

    const { user } = useSelector((state: RootState) => state.user);
    const [receiverId, setReceiverId] = useState<string | null>(null);

    const [socket, setSocket] = useState<Socket | null>(null);

    const [loadingChats, setLoadingChats] = useState<boolean>(false);
    const [sendingMessage, setSendingMessage] = useState<{
        chatId: string;
        message: string;
        isSent: boolean;
        isError: boolean;
        time: number;
    }[]>([]);

    const [chats, setChats] = useState<{
        _id: string;
        senderId: string;
        message: string;
        sentAt: Date;
        isRead: boolean;
    }[] | null>(null);

    const getMessages = async (chatId: string) => {

        setLoadingChats(true);
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No token found");
            return
        };

        try {
            const response = await fetch('/api/messages/getMessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chatId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched chats:", data.chats);
            setChats(data.chats);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingChats(false);
        }
    }

    const chatId = useMemo(() => {
        if (user?._id && receiverId) {
            return user?._id < receiverId ? `${user?._id}_${receiverId}` : `${receiverId}_${user?._id}`
        } else {
            return null;
        }
    }, [user?._id, receiverId]);

    useEffect(() => {
        if (chatId) {
            setChats(null);
            getMessages(chatId);
        }
    }, [chatId]);

    useEffect(() => {
        // Connect to the backend Socket.IO server.
        const newSocket = io("http://localhost:3000", {
            path: SOCKET_PATH,
            auth: {
                token: localStorage.getItem("token"),
            }
        });

        newSocket.on("connectionUpdated", (newConnection) => {
            if (user?.connections) {
                const updatedConnectionsArray = [...user?.connections, newConnection];
                dispatch(updateConnections(updatedConnectionsArray));
            }
        });

        newSocket.on("messageSent", (messageDetails) => {
            const { time } = messageDetails;
            setSendingMessage((prev) => {
                const updatedArray = [...prev];
                const index = updatedArray.findIndex((item) => item.time === time);
                if (index !== -1) {
                    updatedArray[index].isSent = true;
                }
                return updatedArray;
            });
        });

        setSocket(newSocket);

        // Clean up the socket connection when the component unmounts.
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = (message: string) => {
        if (!message) return;

        if (socket && chatId) {
            setSendingMessage((prev) => ([...prev, { chatId, message, isSent: false, isError: false, time: Date.now() }]));
            socket.emit("sendMessage", {
                senderId: user?._id,
                receiverId: receiverId,
                message: message,
                time: Date.now(),
            });
        } else {
            // Todo: Handle the case where the socket or chatId is not available.
            console.error("Socket or chatId is not available.");
        }
    };

    const markAsRead = async () => { };

    return (
        <ChatContext.Provider value={{ receiverId, setReceiverId, chats, loadingChats, socket }}>
            {children}
        </ChatContext.Provider>
    )
}

const useChatContext = () => useContext(ChatContext);

export { ChatContextProvider, useChatContext };

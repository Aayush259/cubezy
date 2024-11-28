import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const ChatContext = createContext<{
    receiverId: string | null;
    setReceiverId: (id: string) => void;
    chats: {
        senderId: string;
        message: string;
        sentAt: Date;
    }[] | null;
    loadingChats: boolean;
}>({
    receiverId: null,
    setReceiverId: (id: string) => { },
    chats: null,
    loadingChats: false,
})

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { user } = useSelector((state: RootState) => state.user);
    const [receiverId, setReceiverId] = useState<string | null>(null);

    const [loadingChats, setLoadingChats] = useState<boolean>(false);
    const [chats, setChats] = useState<{
        senderId: string;
        message: string;
        sentAt: Date;
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

    return (
        <ChatContext.Provider value={{ receiverId, setReceiverId, chats, loadingChats }}>
            {children}
        </ChatContext.Provider>
    )
}

const useChatContext = () => useContext(ChatContext);

export { ChatContextProvider, useChatContext };

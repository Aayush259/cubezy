import { createContext, useContext, useState } from "react";

const ChatContext = createContext<{
    receiverId: string | null;
    setReceiverId: (id: string) => void;
}>({
    receiverId: null,
    setReceiverId: (id: string) => {},
})

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [receiverId, setReceiverId] = useState<string | null>(null);

    return (
        <ChatContext.Provider value={{ receiverId, setReceiverId }}>
            {children}
        </ChatContext.Provider>
    )
}

const useChatContext = () => useContext(ChatContext);

export { ChatContextProvider, useChatContext };

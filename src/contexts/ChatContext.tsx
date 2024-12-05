import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { io, Socket } from "socket.io-client";
import { updateConnections } from "../store/userSlice";
import { v4 as uuidv4 } from "uuid";
import { IChatMessage, ILastMessage } from "../interfaces/interfaces";

const SOCKET_PATH = "/api/socket/connect"

const ChatContext = createContext<{
    receiverId: string | null;
    setReceiverId: (id: string) => void;
    chats: IChatMessage[];
    lastMessages: ILastMessage[];
    loadingChats: boolean;
    sendMessage: (message: string) => void;
}>({
    receiverId: null,
    setReceiverId: (id: string) => { },
    lastMessages: [],
    chats: [],
    loadingChats: false,
    sendMessage: (message: string) => { },
})

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const dispatch = useDispatch();

    const { user } = useSelector((state: RootState) => state.user);
    const [receiverId, setReceiverId] = useState<string | null>(null);

    const [socket, setSocket] = useState<Socket | null>(null);

    const [loadingChats, setLoadingChats] = useState<boolean>(true);

    const [chats, setChats] = useState<IChatMessage[]>([]);

    const [lastMessages, setLastMessages] = useState<ILastMessage[]>([]);
    const [loadingLastMessages, setLoadingLastMessages] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const chatId = useMemo(() => {
        if (user?._id && receiverId) {
            return user?._id < receiverId ? `${user?._id}_${receiverId}` : `${receiverId}_${user?._id}`
        } else {
            return null;
        }
    }, [user?._id, receiverId]);

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
    };

    const sendMessage = (message: string) => {
        if (!message) return;

        if (socket && chatId) {
            const tempId = uuidv4();
            const tempMessage: IChatMessage = {
                _id: tempId,
                senderId: user?._id as string,
                message,
                sentAt: new Date(),
                isRead: false,
                status: "sending",
            };

            setChats(prevChats => prevChats ? [...prevChats, tempMessage] : [tempMessage]);

            socket.emit("sendMessage", {
                senderId: user?._id,
                receiverId,
                message
            }, (response: any) => {
                setChats(prevChats => {
                    const updatedChats = prevChats?.map(chat => chat._id === tempId ? { ...chat, _id: response._id, sentAt: response.sentAt, status: "sent" } as IChatMessage : chat) || null;

                    return updatedChats;
                });

                setLastMessages(prevMessages => {
                    const existingIndex = prevMessages.findIndex(pmessage => pmessage.chatId === chatId);
                    const newLastMessage = {
                        chatId,
                        lastMessage: {
                            _id: response._id,
                            senderId: user?._id as string,
                            message: message,
                            sentAt: response.sentAt,
                            isRead: false,
                        },
                    };
                
                    if (existingIndex !== -1) {
                        // Update existing entry
                        return prevMessages.map((msg, idx) =>
                            idx === existingIndex ? newLastMessage : msg
                        );
                    } else {
                        // Add new entry if it doesn't exist
                        return [...prevMessages, newLastMessage];
                    }
                });
            })
        } else {
            // Todo: Handle the case where the socket or chatId is not available.
            console.error("Socket or chatId is not available.");
        }
    };

    const markAsRead = async (messageIds?: string[]) => {

        if (socket && chatId) {
            socket.emit("markAsRead", {
                chatId: chatId,
                messageIds: messageIds ? messageIds : chats?.map((chat) => chat._id),
            });

            setChats(prevChats => {
                const updatedChats = prevChats?.map(chat => {
                    if (messageIds && messageIds.includes(chat._id)) {
                        return { ...chat, isRead: true };
                    }
                    return chat;
                });
                return updatedChats;
            });

            setLastMessages(prevLastMessages => {
                const updatedLastMessages = prevLastMessages.map(lastMessage => {
                    if (lastMessage.chatId === chatId) {
                        return {
                            ...lastMessage,
                            lastMessage: {
                                ...lastMessage.lastMessage,
                                isRead: true
                            }
                        };
                    }
                    return lastMessage;
                });
                return updatedLastMessages;
            });
        }
    };

    useEffect(() => {
        if (chatId) {
            setChats([]);
            getMessages(chatId);

            // Mark all messages as read when the user opens the chat.
            markAsRead();
        }
    }, [chatId]);

    const fetchLastMessages = async () => {
        setLoadingLastMessages(true);
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No token found");
            return;
        }

        try {
            const response = await fetch('/api/messages/getLastMessages', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log("Fetched last messages:", data.lastMessages);
            setLastMessages(data.lastMessages);
        } catch (error) {
            setError("Error fetching last messages");
        } finally {
            setLoadingLastMessages(false);
        }
    }

    useEffect(() => {
        fetchLastMessages();
    }, []);

    useEffect(() => {
        // Connect to the backend Socket.IO server.
        const newSocket = io("http://localhost:3000", {
            path: SOCKET_PATH,
            auth: {
                token: localStorage.getItem("token"),
            }
        });

        setSocket(newSocket);

        // Clean up the socket connection when the component unmounts.
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("connectionUpdated", (newConnection) => {
                if (user?.connections) {
                    const updatedConnectionsArray = [...user?.connections, newConnection];
                    dispatch(updateConnections(updatedConnectionsArray));
                }
            });

            socket.on("receiveMessage", (messageDetails) => {
                const senderId = messageDetails.senderId;
                if (senderId === receiverId) {
                    setChats(prevChats => prevChats ? [...prevChats, messageDetails] : [messageDetails]);
                }

                const nChatId = user?._id as string < messageDetails.senderId ? `${user?._id}_${messageDetails.senderId}` : `${messageDetails.senderId}_${user?._id}`;
                setLastMessages(prevLastMessages => {
                    const updatedLastMessages = prevLastMessages?.map(lastMessage => {
                        if (lastMessage.chatId === nChatId) {
                            return {
                                ...lastMessage,
                                lastMessage: messageDetails,
                            };
                        }
                        return lastMessage;
                    });
                    return updatedLastMessages;
                });
            });

            socket.on("messageRead", ({ chatId, messageIds }) => {
                setChats(prevChats => prevChats?.map(chat => messageIds?.includes(chat._id) ? { ...chat, isRead: true, status: "sent" } : chat) || null);
            });
        }
    }, [chatId, socket, receiverId]);

    useEffect(() => {
        if (socket && chatId) {
            const messageIds = chats.filter(chat => chat.isRead === false && chat.senderId !== user?._id)
                .map(chat => chat._id);
            if (messageIds && messageIds?.length > 0) {
                markAsRead(messageIds);
            }
        }
    }, [chats]);

    return (
        <ChatContext.Provider value={{ receiverId, setReceiverId, lastMessages, chats, loadingChats, sendMessage }}>
            {
                loadingLastMessages ? <p>LOading...</p> : children
            }
        </ChatContext.Provider>
    )
}

const useChatContext = () => useContext(ChatContext);

export { ChatContextProvider, useChatContext };

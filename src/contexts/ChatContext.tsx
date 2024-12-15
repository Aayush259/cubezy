"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { io, Socket } from "socket.io-client";
import { updateConnections, updateUser } from "../store/userSlice";
import { v4 as uuidv4 } from "uuid";
import { IChatMessage, ILastMessage } from "../../utils/interfaces/interfaces";
import Loader from "../components/Loader";
import { useToast } from "./ToastContext";

const SOCKET_PATH = "/api/socket/connect";

const ChatContext = createContext<{
    receiverId: string | null;
    updateReceiverId: (id: string | null) => void;
    chats: IChatMessage[];
    lastMessages: ILastMessage[];
    loadingChats: boolean;
    sendMessage: (message: string) => void;
    addDp: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onlineConnections: string[];
}>({
    receiverId: null,
    updateReceiverId: () => { },
    lastMessages: [],
    chats: [],
    loadingChats: false,
    sendMessage: () => { },
    addDp: () => { },
    onlineConnections: [],
})

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const dispatch = useDispatch();

    // User state from store.
    const { user } = useSelector((state: RootState) => state.user);

    const { addToast } = useToast();

    // const [receiverId, setReceiverId] = useState<string | null>(null);      // Receiver ID.
    const [socket, setSocket] = useState<Socket | null>(null);      // Socket.
    const [loadingChats, setLoadingChats] = useState<boolean>(true);    // Loading chats state.
    const [chats, setChats] = useState<IChatMessage[]>([]);     // Chats state.
    const [lastMessages, setLastMessages] = useState<ILastMessage[]>([]);       // Last messages state.
    const [loadingLastMessages, setLoadingLastMessages] = useState<boolean>(true);      // Loading last messages state.
    const [onlineConnections, setOnlineConnections] = useState<string[]>([]);      // Online connections state.
    const [error, setError] = useState<string | null>(null);    // Error state.

    // Reference to the receiver ID.
    const receiverIdRef = useRef<string | null>(null);
    const [receiverId, setReceiverId] = useState<string | null>(null);

    // Reference to the active connections.
    const activeConnections = useRef<string[]>([]);

    // Function to update the active connections.
    const setActiveConnections = (connections: string[]) => {
        activeConnections.current = connections;
        setOnlineConnections(connections);
    };

    // Function to update the receiver ID.
    const setReceiverIdRef = (id: string | null) => {
        if (receiverIdRef.current === id) return;
        receiverIdRef.current = id;
        setReceiverId(id);
    };

    const chatId = useMemo(() => {
        if (user?._id && receiverIdRef.current) {
            return user?._id < receiverIdRef.current ? `${user?._id}_${receiverIdRef.current}` : `${receiverIdRef.current}_${user?._id}`
        } else {
            return null;
        }
    }, [user?._id, receiverId]);

    // Function to update the receiver ID.
    const updateReceiverId = (id: string | null) => {
        if (receiverIdRef.current === id) return;
        setLoadingChats(true);
        setReceiverIdRef(id);
    };

    // Function to get messages.
    const getMessages = async (chatId: string) => {

        // Set loading state to true and get the token.
        setLoadingChats(true);
        const token = localStorage.getItem("token");

        // Check if token exists.
        if (!token) {
            console.log("No token found");
            addToast("Something went wrong", false);
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
                addToast("Something went wrong", false);
            }

            const data = await response.json();
            setChats(data.chats);
        } catch (error) {
            console.log(error);
            addToast("Something went wrong", false);
        } finally {
            setLoadingChats(false);
        }
    };

    // Function to send a message.
    const sendMessage = (message: string) => {
        // Check if message is empty.
        if (!message) return;

        if (socket && chatId) {
            // Create a temporary message id.
            const tempId = uuidv4();

            // Create a temporary message.
            const tempMessage: IChatMessage = {
                _id: tempId,
                senderId: user?._id as string,
                message,
                sentAt: new Date(),
                isRead: false,
                status: "sending",
            };

            // Add the temporary message to the chats state.
            setChats(prevChats => prevChats ? [...prevChats, tempMessage] : [tempMessage]);

            // Emit the message to the server.
            socket.emit("sendMessage", {
                senderId: user?._id,
                receiverId: receiverIdRef.current,
                message
            }, (response: any) => {
                // Check if the response is successful.
                if (!response.success) {
                    // Show error message
                    addToast("Failed to send", false);

                    // Remove temporary message from chats state.
                    setChats(prevChats => prevChats?.filter(chat => chat._id !== tempId) || null);
                    return;
                }

                // Update the temporary message with the response.
                setChats(prevChats => {
                    const updatedChats = prevChats?.map(chat => chat._id === tempId ? { ...chat, _id: response._id, sentAt: response.sentAt, status: "sent" } as IChatMessage : chat) || null;

                    return updatedChats;
                });

                // Update the last message in the last messages state.
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
            addToast("Something went wrong", false);
        }
    };

    // Function to mark a message as read.
    const markAsRead = async (messageIds?: string[]) => {

        if (socket && chatId) {
            // Emit the messageIds to the server to mark it as read.
            socket.emit("markAsRead", {
                chatId: chatId,
                messageIds: messageIds ? messageIds : chats?.map((chat) => chat._id),
            });

            // Update the chats state to mark the messages as read.
            setChats(prevChats => {
                const updatedChats = prevChats?.map(chat => {
                    if (messageIds && messageIds.includes(chat._id)) {
                        return { ...chat, isRead: true };
                    }
                    return chat;
                });
                return updatedChats;
            });

            // Update the last messages state to mark the last message as read.
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

    // Function to add DP.
    const addDp = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!socket || !user) return;

        // Get the selected file from the input element.
        const input = event.target;
        if (!input.files || input.files.length === 0) {
            console.error("No file selected");
            addToast("No file selected", false);
            return;
        }

        const dp = input.files[0];

        // Check if the file is an image.
        if (dp && dp.type.startsWith('image/')) {
            console.log('File accepted:', dp);
        } else {
            addToast("Invalid Image", false);
            console.log("Invalid file type");
        };

        // Convert the file to a buffer.
        const buffer = await dp.arrayBuffer();

        // Emit the buffer to the server.
        socket.emit("setProfilePicture", { file: buffer }, (response: any) => {
            if (response.success) {
                dispatch(updateUser({ ...user, dp: response.dp }));
            } else {
                console.log("Error updating dp", response);
                addToast("Something went wrong", false);
            }
        })
    };

    useEffect(() => {
        if (chatId) {
            setChats([]);
            getMessages(chatId);

            // Mark all messages as read when the user opens the chat.
            markAsRead();
        }
    }, [chatId]);

    // Function to fetch the last messages.
    const fetchLastMessages = async () => {
        // Set loading state to true and get the token.
        setLoadingLastMessages(true);
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No token found");
            addToast("Something went wrong", false);
            return;
        }

        try {
            // Fetch the last messages from the server.
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
            console.log(error);
            setError("Error fetching last messages");
            addToast("Something went wrong", false);
        } finally {
            setLoadingLastMessages(false);
        }
    };

    useEffect(() => {
        fetchLastMessages();
    }, []);

    useEffect(() => {
        // Connect to the backend Socket.IO server.
        const newSocket = io("", {
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

            // Listen for the "userActive" event from the server.
            socket.on("userActive", ({ userId }) => {
                setActiveConnections([...activeConnections.current, userId]);
            });

            // Listen for the "userInactive" event from the server.
            socket.on("userInactive", ({ userId }) => {
                console.log(activeConnections.current);
                setActiveConnections(activeConnections.current.filter((id) => id !== userId));
            });

            // Listen for the "activeConnections" event from the server.
            socket.on("activeConnections", ({ activeUserIds }) => {
                setActiveConnections(activeUserIds);
            });

            socket.on("addActiveConnection", ({ activeUserId }) => {
                setActiveConnections([...activeConnections.current, activeUserId]);
            });

            // Listen for the "connectionUpdated" event from the server.
            socket.on("connectionUpdated", (newConnection) => {
                if (user?.connections) {
                    const updatedConnectionsArray = [...user?.connections, newConnection];
                    dispatch(updateConnections(updatedConnectionsArray));
                }
            });

            // Listen for the "receiveMessage" event from the server.
            socket.on("receiveMessage", (messageDetails) => {
                const senderId = messageDetails.senderId;
                if (senderId === receiverIdRef.current) {
                    console.log("Received message:", messageDetails);
                    console.log(receiverIdRef.current);
                    setChats(prevChats => prevChats ? [...prevChats, messageDetails] : [messageDetails]);
                } else {
                    addToast(`New message from ${user?.connections.find(connection => connection._id === senderId)?.name.split(" ")[0]}`, true);
                }

                const nChatId = user?._id as string < messageDetails.senderId ? `${user?._id}_${messageDetails.senderId}` : `${messageDetails.senderId}_${user?._id}`;
                setLastMessages(prevLastMessages => {
                    // Check if the chat ID already exists in the lastMessages array
                    const existingIndex = prevLastMessages.findIndex(lastMessage => lastMessage.chatId === nChatId);

                    if (existingIndex !== -1) {
                        // Update the existing lastMessage for this chat
                        return prevLastMessages.map((lastMessage, idx) =>
                            idx === existingIndex
                                ? { ...lastMessage, lastMessage: messageDetails }
                                : lastMessage
                        );
                    } else {
                        // Add a new entry for this chat if it doesn't exist
                        return [
                            ...prevLastMessages,
                            {
                                chatId: nChatId,
                                lastMessage: messageDetails,
                            },
                        ];
                    }
                });
            });

            // Listen for the "messageRead" event from the server.
            socket.on("messageRead", ({ chatId, messageIds }) => {
                console.log(chatId);
                setChats(prevChats => prevChats?.map(chat => messageIds?.includes(chat._id) ? { ...chat, isRead: true, status: "sent" } : chat) || null);
            });

            // Listen for the "profilePictureUpdated" event from the server.
            socket.on("profilePictureUpdated", ({ userId, dp }) => {
                const updatedConnections = user?.connections?.map(connection => (connection._id === userId ? { ...connection, dp } : connection));

                dispatch(updateUser({ ...user, connections: updatedConnections }));
            });
        }
    }, [socket]);

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
        <ChatContext.Provider value={{ receiverId: receiverId, updateReceiverId, lastMessages, chats, loadingChats, sendMessage, addDp, onlineConnections }}>
            {
                loadingLastMessages ? <Loader /> : error ? <p>Something went wrong</p> : children
            }
        </ChatContext.Provider>
    )
}

const useChatContext = () => useContext(ChatContext);

export { ChatContextProvider, useChatContext };

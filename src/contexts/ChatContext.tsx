"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { io, Socket } from "socket.io-client";
import { addDpInStore, updateConnections, updateUser } from "../store/userSlice";
import { v4 as uuidv4 } from "uuid";
import { IChatMessage, ILastMessage } from "../../utils/interfaces/interfaces";
import Loader from "../components/Loader";
import { useToast } from "./ToastContext";

const SOCKET_PATH = "/api/socket/connect";

const ChatContext = createContext<{
    socket: Socket | null;
    receiverId: string | null;
    updateReceiverId: (id: string | null) => void;
    chats: IChatMessage[];
    setChats: React.Dispatch<React.SetStateAction<IChatMessage[]>>;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    hasMore: boolean;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    lastMessages: ILastMessage[];
    loadingChats: boolean;
    setLoadingChats: (loading: boolean) => void;
    sendMessage: (message: string) => void;
    markAsRead: (messageIds?: string[]) => void;
    addDp: (event: React.ChangeEvent<HTMLInputElement>) => void;
    updateBio: (bio: string) => void;
    onlineConnections: string[];
    selectedMessages: IChatMessage[];
    addSelectedMessage: (message: IChatMessage) => void;
    removeSelectedMessage: (messageId: string) => void;
    clearSelectedMessages: () => void;
    deleteMessage: () => void;
    forwardMessageWindowVisible: boolean;
    openForwardMessageWindow: () => void;
    closeForwardMessageWindow: () => void;
    forwardToReceiverIds: string[];
    addForwardToReceiverId: (id: string) => void;
    removeForwardToReceiverId: (id: string) => void;
    forwardMessages: () => void;
    chatId: string | null;
}>({
    socket: null,
    receiverId: null,
    updateReceiverId: () => { },
    lastMessages: [],
    chats: [],
    setChats: () => { },
    page: 1,
    setPage: () => { },
    hasMore: true,
    setHasMore: () => { },
    loadingChats: false,
    setLoadingChats: () => { },
    sendMessage: () => { },
    markAsRead: () => { },
    addDp: () => { },
    updateBio: () => { },
    onlineConnections: [],
    selectedMessages: [],
    addSelectedMessage: () => { },
    removeSelectedMessage: () => { },
    clearSelectedMessages: () => { },
    deleteMessage: () => { },
    forwardMessageWindowVisible: false,
    openForwardMessageWindow: () => { },
    closeForwardMessageWindow: () => { },
    forwardToReceiverIds: [],
    addForwardToReceiverId: () => { },
    removeForwardToReceiverId: () => { },
    forwardMessages: () => { },
    chatId: null,
})

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const dispatch = useDispatch();

    // User state from store.
    const { user } = useSelector((state: RootState) => state.user);

    const { addToast } = useToast();

    const [socket, setSocket] = useState<Socket | null>(null);      // Socket.
    const [loadingChats, setLoadingChats] = useState<boolean>(false);    // Loading chats state.
    const [chats, setChats] = useState<IChatMessage[]>([]);     // Chats state.
    const [page, setPage] = useState<number>(1);       // Page state.
    const [hasMore, setHasMore] = useState<boolean>(true);       // Has more state.
    const [lastMessages, setLastMessages] = useState<ILastMessage[]>([]);       // Last messages state.
    const [loadingLastMessages, setLoadingLastMessages] = useState<boolean>(true);      // Loading last messages state.
    const [onlineConnections, setOnlineConnections] = useState<string[]>([]);      // Online connections state.
    const [error, setError] = useState<string | null>(null);    // Error state.

    // Reference to the receiver ID.
    const receiverIdRef = useRef<string | null>(null);
    const [receiverId, setReceiverId] = useState<string | null>(null);

    // Reference to the active connections.
    const activeConnections = useRef<string[]>([]);

    // State to track selected messages.
    const [selectedMessages, setSelectedMessages] = useState<IChatMessage[]>([]);

    // State to track receiver's id for forwarding messages.
    const [forwardToReceiverIds, setForwardToReceiverIds] = useState<string[]>([]);

    // State to track forward message window visibility.
    const [forwardMessageWindowVisible, setForwardMessageWindowVisible] = useState<boolean>(false);

    // Function to add receiver's id to the list of forwardToReceiverIds.
    const addForwardToReceiverId = (receiverId: string) => {
        setForwardToReceiverIds((prevIds) => [...prevIds, receiverId]);
    };

    // Function to remove receiver's id from the list of forwardToReceiverIds.
    const removeForwardToReceiverId = (receiverId: string) => {
        setForwardToReceiverIds((prevIds) => prevIds.filter((id) => id !== receiverId));
    };

    // Function to clear the list of forwardToReceiverIds.
    const clearForwardToReceiverIds = () => {
        setForwardToReceiverIds([]);
    };

    // Function to close the forward message window.
    const closeForwardMessageWindow = () => {
        setForwardMessageWindowVisible(false);
    };

    // Function to open the forward message window.
    const openForwardMessageWindow = () => {
        setForwardMessageWindowVisible(true);
    };

    // Function to add append selected message.
    const addSelectedMessage = (message: IChatMessage) => {
        setSelectedMessages((prevSelectedMessages) => [...prevSelectedMessages, message]);
    };

    // Function to remove selected message.
    const removeSelectedMessage = (messageId: string) => {
        setSelectedMessages((prevSelectedMessages) => prevSelectedMessages.filter(message => message._id !== messageId));
    };

    // Function to clear selected messages.
    const clearSelectedMessages = () => {
        setSelectedMessages([]);
    };

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
        // setLoadingChats(true);
        setReceiverIdRef(id);
    };

    // Function to send a message.
    const sendMessage = (message: string) => {
        // Check if message is empty.
        if (!message || !message.trim()) return;

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

    // Function to forward messages.
    const forwardMessages = () => {
        closeForwardMessageWindow();

        if (!user?._id) {
            addToast("Something went wrong", false);
            return;
        }

        if (!socket) {
            addToast("Something went wrong", false);
            return;
        }

        // Check if there are selected messages and receivers
        if (selectedMessages.length === 0 || forwardToReceiverIds.length === 0) {
            addToast("No messages or receivers selected", false);
            return;
        }

        forwardToReceiverIds.forEach(forwardToReceiverId => {
            // Generate a real chatId temporarily for now.
            const tempChatId = user?._id < forwardToReceiverId ? `${user?._id}_${forwardToReceiverId}` : `${forwardToReceiverId}_${user?._id}`;

            selectedMessages.forEach(message => {
                // Create a temporary message ID for the forwarded message
                const tempId = uuidv4();

                // Create a temporary message object
                const forwardedMessage: IChatMessage = {
                    _id: tempId,
                    senderId: user?._id as string,
                    message: message.message, // Copy the message content
                    sentAt: new Date(),
                    isRead: false,
                    status: "sending",
                };

                const isOpenedReceiverSameAsForwardReceiver = forwardToReceiverId === receiverIdRef.current;

                if (isOpenedReceiverSameAsForwardReceiver) {
                    // Add the forwarded message to the chats state
                    setChats(prevChats => prevChats ? [...prevChats, forwardedMessage] : [forwardedMessage]);
                };

                // Emit the message to the server.
                socket.emit("sendMessage", {
                    senderId: user?._id,
                    receiverId: forwardToReceiverId,
                    message: message.message,
                }, (response: any) => {
                    if (!response.success) {
                        addToast(`Failed to forward message to ${receiverId}`, false);

                        if (isOpenedReceiverSameAsForwardReceiver) {
                            // Remove the temporary message on failure.
                            setChats(prevChats => prevChats?.filter(chat => chat._id !== tempId) || null);
                        }
                        return;
                    }

                    if (isOpenedReceiverSameAsForwardReceiver) {
                        // Update the temporary message to mark it as sent
                        setChats(prevChats => {
                            const updatedChats = prevChats?.map(chat => chat._id === tempId ? { ...chat, _id: response._id, sentAt: response.sentAt, status: "sent" } as IChatMessage : chat) || null;

                            return updatedChats;
                        });
                    }

                    // Update the lastMessages state for the forwarded message.
                    setLastMessages(prevMessages => {
                        const existingIndex = prevMessages.findIndex(msg => msg.chatId === tempChatId);

                        const newLastMessage: ILastMessage = {
                            chatId: tempChatId,
                            lastMessage: {
                                _id: response._id,
                                senderId: user?._id as string,
                                message: message.message,
                                sentAt: response.sentAt,
                                isRead: false,
                            },
                        };

                        if (existingIndex !== -1) {
                            // Update the existing entry
                            return prevMessages.map((msg, idx) =>
                                idx === existingIndex ? newLastMessage : msg
                            );
                        } else {
                            // Add a new entry if it doesn't exist
                            return [...prevMessages, newLastMessage];
                        }
                    });
                });
            });
        });

        // Clear selected messages and receivers after forwarding.
        clearSelectedMessages();
        clearForwardToReceiverIds();
    };

    // Function to mark a message as read.
    const markAsRead = (messageIds?: string[]) => {

        if (socket && chatId) {

            const payload = {
                chatId: chatId,
                messageIds: messageIds ? messageIds : chats?.map((chat) => chat._id),
            };

            if (payload.messageIds.length === 0) {
                return;
            }

            // Emit the messageIds to the server to mark it as read.
            socket.emit("markAsRead", payload);

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

    // Function to delete a message.
    const deleteMessage = () => {
        if (!socket || !chatId || selectedMessages.length === 0) return;

        const messageIdsToDelete = selectedMessages.map(message => message._id);

        // Update the chats state to remove the deleted messages.
        setChats(prevChats => prevChats.filter(chat => !messageIdsToDelete.includes(chat._id)));
        // Update the last messages state to remove the deleted messages.
        setLastMessages(prevLastMessages => prevLastMessages.filter(prevLastMessage => !messageIdsToDelete.includes(prevLastMessage.lastMessage._id)));
        clearSelectedMessages();

        // Emit the messageIds to the server to delete the messages.
        socket.emit("deleteMessage", {
            chatId,
            messageIds: messageIdsToDelete,
        }, (response: any) => {
            if (!response.success) {
                addToast("Failed to delete", false);
                return;
            }
        });
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
        if (!(dp && dp.type.startsWith('image/'))) {
            addToast("Invalid Image", false);
            return;
        };

        // Check if the file size is too large.
        if (dp.size > 1024 * 1024 * 1) {
            addToast("File size too large", false);
            return;
        };

        // Convert the file to a buffer.
        const buffer = await dp.arrayBuffer();

        // Emit the buffer to the server.
        socket.emit("setProfilePicture", { file: buffer }, (response: any) => {
            if (response.success) {
                dispatch(updateUser({ ...user, dp: response.dp }));
            } else {
                addToast("Something went wrong", false);
            }
        })
    };

    // Function to update bio.
    const updateBio = (bio: string) => {
        if (!socket || !user) return;
        socket.emit("setBio", { bio }, (response: any) => {
            if (response.success) {
                dispatch(updateUser({ ...user, bio: response.bio }));
            } else {
                addToast("Something went wrong", false);
            }
        })
    };

    // Function to fetch the last messages.
    const fetchLastMessages = async () => {
        // Set loading state to true and get the token.
        setLoadingLastMessages(true);
        const token = localStorage.getItem("token");

        if (!token) {
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
            setLastMessages(data.lastMessages);
        } catch {
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
                    setChats(prevChats => prevChats ? [...prevChats, messageDetails] : [messageDetails]);
                } else {
                    const senderName = user?.connections.find(connection => connection._id === senderId)?.name.split(" ")[0];
                    addToast(`New message ${senderName ? ("from " + senderName) : ""}`, true);
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
            socket.on("messageRead", ({ messageIds }) => {
                setChats(prevChats => prevChats?.map(chat => messageIds?.includes(chat._id) ? { ...chat, isRead: true, status: "sent" } : chat) || null);
            });

            // Listen for the "profilePictureUpdated" event from the server.
            socket.on("profilePictureUpdated", ({ userId, dp }) => {
                dispatch(addDpInStore({ userId, dp }));
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
        <ChatContext.Provider value={{ socket, receiverId: receiverId, updateReceiverId, lastMessages, chats, setChats, page, setPage, hasMore, setHasMore, loadingChats, setLoadingChats, sendMessage, markAsRead, addDp, updateBio, onlineConnections, selectedMessages, addSelectedMessage, removeSelectedMessage, clearSelectedMessages, deleteMessage, forwardMessageWindowVisible, openForwardMessageWindow, closeForwardMessageWindow, forwardToReceiverIds, addForwardToReceiverId, removeForwardToReceiverId, forwardMessages, chatId }}>
            {
                loadingLastMessages ? <Loader /> : error ? <p>Something went wrong</p> : children
            }
        </ChatContext.Provider>
    )
}

const useChatContext = () => useContext(ChatContext);

export { ChatContextProvider, useChatContext };

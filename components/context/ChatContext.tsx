"use client"
import { v4 as uuidv4 } from "uuid"
import Loader from "../common/Loader"
import requests from "@/lib/services/requests"
import { useToast } from "./ToastContext"
import { io, Socket } from "socket.io-client"
import { RootState } from "@/lib/store/store"
import { EVENTS } from "@/helpers/socket-helpers"
import { useDispatch, useSelector } from "react-redux"
import { IChatMessage, IConnection, ILastMessage, IUser } from "@/lib/interfaces"
import { updateConnections, updateUser } from "@/lib/store/features/userSlice"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

const SOCKET_PATH = "/api/socket/connect"

interface IChatContext {
    socket: Socket | null
    receiverId: string | null
    updateReceiverId: (id: string | null) => void
    chats: IChatMessage[]
    setChats: React.Dispatch<React.SetStateAction<IChatMessage[]>>
    page: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    hasMore: boolean
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    lastMessages: ILastMessage[]
    loadingChats: boolean
    setLoadingChats: (loading: boolean) => void
    sendMessage: (message: string) => void
    markAsRead: (messageIds?: string[]) => void
    addDp: (event: React.ChangeEvent<HTMLInputElement>) => void
    addConnection: ({ userEmailToAdd, success, failure }: { userEmailToAdd: string, success: () => void, failure: () => void }) => void
    updateBio: (bio: string) => void
    onlineConnections: string[]
    selectedMessages: IChatMessage[]
    addSelectedMessage: (message: IChatMessage) => void
    removeSelectedMessage: (messageId: string) => void
    clearSelectedMessages: () => void
    deleteMessage: (flag: "me" | "everyone") => void
    forwardMessageWindowVisible: boolean
    openForwardMessageWindow: () => void
    closeForwardMessageWindow: () => void
    forwardToReceiverIds: string[]
    addForwardToReceiverId: (id: string) => void
    removeForwardToReceiverId: (id: string) => void
    forwardMessages: () => void
    chatId: string | null
    deleteWindowVisible: boolean
    openDeleteWindow: () => void
    closeDeleteWindow: () => void
}

const ChatContext = createContext<IChatContext | null>(null)

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch()

    // User state from store.
    const { user } = useSelector((state: RootState) => state.user)
    const { addToast } = useToast()

    const [socket, setSocket] = useState<Socket | null>(null)      // Socket.
    const [loadingChats, setLoadingChats] = useState<boolean>(false)    // Loading chats state.
    const [chats, setChats] = useState<IChatMessage[]>([])     // Chats state.
    const [page, setPage] = useState<number>(1)       // Page state.
    const [hasMore, setHasMore] = useState<boolean>(true)       // Has more state.
    const [lastMessages, setLastMessages] = useState<ILastMessage[]>([])       // Last messages state.
    const [loadingLastMessages, setLoadingLastMessages] = useState<boolean>(true)      // Loading last messages state.
    const [onlineConnections, setOnlineConnections] = useState<string[]>([])      // Online connections state.
    const [error, setError] = useState<string | null>(null)    // Error state.

    // Reference to the receiver ID.
    const receiverIdRef = useRef<string | null>(null)
    const [receiverId, setReceiverId] = useState<string | null>(null)

    // Reference to the active connections.
    const activeConnections = useRef<string[]>([])

    // State to track selected messages.
    const [selectedMessages, setSelectedMessages] = useState<IChatMessage[]>([])

    // State to track receiver's id for forwarding messages.
    const [forwardToReceiverIds, setForwardToReceiverIds] = useState<string[]>([])

    // State to track forward message window visibility.
    const [forwardMessageWindowVisible, setForwardMessageWindowVisible] = useState<boolean>(false)

    // State to track delete window visibility
    const [deleteWindowVisible, setDeleteWindowVisible] = useState<boolean>(false)

    // Function to add receiver's id to the list of forwardToReceiverIds.
    const addForwardToReceiverId = (receiverId: string) => {
        setForwardToReceiverIds((prevIds) => [...prevIds, receiverId])
    }

    // Function to remove receiver's id from the list of forwardToReceiverIds.
    const removeForwardToReceiverId = (receiverId: string) => {
        setForwardToReceiverIds((prevIds) => prevIds.filter((id) => id !== receiverId))
    }

    // Function to clear the list of forwardToReceiverIds.
    const clearForwardToReceiverIds = () => {
        setForwardToReceiverIds([])
    }

    // Function to close the forward message window.
    const closeForwardMessageWindow = () => {
        setForwardMessageWindowVisible(false)
    }

    // Function to open the forward message window.
    const openForwardMessageWindow = () => {
        setForwardMessageWindowVisible(true)
    }

    // Function to open the delete window.
    const openDeleteWindow = () => {
        setDeleteWindowVisible(true)
    }

    // Function to close the delete window.
    const closeDeleteWindow = () => {
        setDeleteWindowVisible(false)
    }

    // Function to add append selected message.
    const addSelectedMessage = (message: IChatMessage) => {
        setSelectedMessages((prevSelectedMessages) => [...prevSelectedMessages, message])
    }

    // Function to remove selected message.
    const removeSelectedMessage = (messageId: string) => {
        setSelectedMessages((prevSelectedMessages) => prevSelectedMessages.filter(message => message._id !== messageId))
    }

    // Function to clear selected messages.
    const clearSelectedMessages = () => {
        setSelectedMessages([])
    }

    // Function to update the active connections.
    const setActiveConnections = (connections: string[]) => {
        activeConnections.current = connections
        setOnlineConnections(connections)
    }

    // Function to update the receiver ID.
    const setReceiverIdRef = (id: string | null) => {
        if (receiverIdRef.current === id) return
        receiverIdRef.current = id
        setReceiverId(id)
    }

    const chatId = useMemo(() => {
        if (user?._id && receiverIdRef.current) {
            return user?._id < receiverIdRef.current ? `${user?._id}_${receiverIdRef.current}` : `${receiverIdRef.current}_${user?._id}`
        } else {
            return null
        }
    }, [user?._id, receiverId])

    // Function to update the receiver ID.
    const updateReceiverId = (id: string | null) => {
        if (receiverIdRef.current === id) return
        // setLoadingChats(true)
        setReceiverIdRef(id)
    }

    // Function to send a message.
    const sendMessage = useCallback((message: string) => {
        // Check if message is empty.
        if (!message || !message.trim()) return

        if (socket && chatId) {
            // Create a temporary message id.
            const tempId = uuidv4()

            // Create a temporary message.
            const tempMessage: IChatMessage = {
                _id: tempId,
                senderId: user?._id as string,
                message,
                sentAt: new Date(),
                isRead: false,
                status: "sending"
            }

            // Add the temporary message to the chats state.
            setChats(prevChats => prevChats ? [...prevChats, tempMessage] : [tempMessage])

            // Emit the message to the server.
            socket.emit(EVENTS.SEND_MESSAGE, {
                senderId: user?._id,
                receiverId: receiverIdRef.current,
                message
            }, (response: { success: boolean, _id: string, sentAt: Date }) => {
                // Check if the response is successful.
                if (!response.success) {
                    // Show error message
                    addToast("Failed to send", false)

                    // Remove temporary message from chats state.
                    setChats(prevChats => prevChats?.filter(chat => chat._id !== tempId) || null)
                    return
                }

                // Update the temporary message with the response.
                setChats(prevChats => {
                    const updatedChats = prevChats?.map(chat => chat._id === tempId ? { ...chat, _id: response._id, sentAt: response.sentAt, status: "sent" } as IChatMessage : chat) || null
                    return updatedChats
                })

                // Update the last message in the last messages state.
                setLastMessages(prevMessages => {
                    const existingIndex = prevMessages.findIndex(pmessage => pmessage.chatId === chatId)
                    const newLastMessage = {
                        chatId,
                        lastMessage: {
                            _id: response._id,
                            senderId: user?._id as string,
                            message: message,
                            sentAt: response.sentAt,
                            isRead: false,
                        }
                    }

                    if (existingIndex !== -1) {
                        // Update existing entry
                        return prevMessages.map((msg, idx) =>
                            idx === existingIndex ? newLastMessage : msg
                        )
                    } else {
                        // Add new entry if it doesn't exist
                        return [...prevMessages, newLastMessage]
                    }
                })
            })
        } else {
            // Todo: Handle the case where the socket or chatId is not available.
            console.error("Socket or chatId is not available.")
            addToast("Something went wrong", false)
        }
    }, [socket, chatId, user, addToast, setChats, setLastMessages])

    // Function to forward messages.
    const forwardMessages = useCallback(() => {
        closeForwardMessageWindow()

        if (!socket || !user?._id) {
            addToast("Something went wrong", false)
            return
        }

        // Check if there are selected messages and receivers
        if (selectedMessages.length === 0 || forwardToReceiverIds.length === 0) {
            addToast("No messages or receivers selected", false)
            return
        }

        forwardToReceiverIds.forEach(forwardToReceiverId => {
            // Generate a real chatId temporarily for now.
            const tempChatId = user?._id < forwardToReceiverId ? `${user?._id}_${forwardToReceiverId}` : `${forwardToReceiverId}_${user?._id}`

            selectedMessages.forEach(message => {
                // Create a temporary message ID for the forwarded message
                const tempId = uuidv4()

                // Create a temporary message object
                const forwardedMessage: IChatMessage = {
                    _id: tempId,
                    senderId: user?._id as string,
                    message: message.message, // Copy the message content
                    sentAt: new Date(),
                    isRead: false,
                    status: "sending"
                }

                const isOpenedReceiverSameAsForwardReceiver = forwardToReceiverId === receiverIdRef.current

                if (isOpenedReceiverSameAsForwardReceiver) {
                    // Add the forwarded message to the chats state
                    setChats(prevChats => prevChats ? [...prevChats, forwardedMessage] : [forwardedMessage])
                }

                // Emit the message to the server.
                socket.emit(EVENTS.SEND_MESSAGE, {
                    senderId: user?._id,
                    receiverId: forwardToReceiverId,
                    message: message.message
                }, (response: { success: boolean, _id: string, sentAt: Date }) => {
                    if (!response.success) {
                        addToast(`Failed to forward message to ${receiverId}`, false)

                        if (isOpenedReceiverSameAsForwardReceiver) {
                            // Remove the temporary message on failure.
                            setChats(prevChats => prevChats?.filter(chat => chat._id !== tempId) || null)
                        }
                        return
                    }

                    if (isOpenedReceiverSameAsForwardReceiver) {
                        // Update the temporary message to mark it as sent
                        setChats(prevChats => {
                            const updatedChats = prevChats?.map(chat => chat._id === tempId ? { ...chat, _id: response._id, sentAt: response.sentAt, status: "sent" } as IChatMessage : chat) || null
                            return updatedChats
                        })
                    }

                    // Update the lastMessages state for the forwarded message.
                    setLastMessages(prevMessages => {
                        const existingIndex = prevMessages.findIndex(msg => msg.chatId === tempChatId)

                        const newLastMessage: ILastMessage = {
                            chatId: tempChatId,
                            lastMessage: {
                                _id: response._id,
                                senderId: user?._id as string,
                                message: message.message,
                                sentAt: response.sentAt,
                                isRead: false,
                            }
                        }

                        if (existingIndex !== -1) {
                            // Update the existing entry
                            return prevMessages.map((msg, idx) =>
                                idx === existingIndex ? newLastMessage : msg
                            )
                        } else {
                            // Add a new entry if it doesn't exist
                            return [...prevMessages, newLastMessage]
                        }
                    })
                })
            })
        })

        // Clear selected messages and receivers after forwarding.
        clearSelectedMessages()
        clearForwardToReceiverIds()
    }, [socket, user, selectedMessages, forwardToReceiverIds, addToast, setChats, setLastMessages, closeForwardMessageWindow])

    // Function to mark a message as read.
    const markAsRead = useCallback((messageIds?: string[]) => {
        if (socket && chatId) {
            const payload = {
                chatId: chatId,
                messageIds: messageIds ? messageIds : chats?.map((chat) => chat._id)
            }

            if (payload.messageIds.length === 0) {
                return
            }

            // Emit the messageIds to the server to mark it as read.
            socket.emit(EVENTS.MARK_AS_READ, payload, (res: { success: true, message: string }) => {
                console.log("=> MAKR_AS_READ response:", res)
            })

            // Update the chats state to mark the messages as read.
            setChats(prevChats => {
                const updatedChats = prevChats?.map(chat => {
                    if (messageIds && messageIds.includes(chat._id)) {
                        return { ...chat, isRead: true }
                    }
                    return chat
                })
                return updatedChats
            })

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
                        }
                    }
                    return lastMessage
                })
                return updatedLastMessages
            })
        }
    }, [chatId, socket, chats, setChats, setLastMessages])

    const deleteMessage = useCallback((flag: "me" | "everyone") => {
        if (!socket || !chatId || selectedMessages.length === 0) return

        const messageIdsToDelete = selectedMessages.map(message => message._id)

        // Update the chats state to remove the deleted messages.
        setChats(prevChats => prevChats.filter(chat => !messageIdsToDelete.includes(chat._id)))
        // Update the last messages state to remove the deleted messages.
        setLastMessages(prevLastMessages => prevLastMessages.filter(prevLastMessage => !messageIdsToDelete.includes(prevLastMessage.lastMessage._id)))
        clearSelectedMessages()
        closeDeleteWindow()

        socket.emit(flag === "me" ? EVENTS.DELETE_MESSAGE_FOR_ME : EVENTS.DELETE_MESSAGE_FOR_EVERYONE, { chatId, messageIds: messageIdsToDelete }, (res: { success: boolean, message: string } | { chatId: string, messageIds: string[] }) => {
            console.log("EVENTS.DELETE_MESSAGE_FOR_ME", res)
        })
    }, [socket, chatId, selectedMessages, setChats, setLastMessages, clearSelectedMessages, closeDeleteWindow])

    // Function to add DP.
    const addDp = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!socket || !user) return

        // Get the selected file from the input element.
        const input = event.target
        if (!input.files || input.files.length === 0) {
            console.error("No file selected")
            addToast("No file selected", false)
            return
        }

        const dp = input.files[0]

        // Check if the file is an image.
        if (!(dp && dp.type.startsWith('image/'))) {
            addToast("Invalid Image", false)
            return
        }

        // Check if the file size is too large.
        if (dp.size > 1024 * 1024 * 1) {
            addToast("File size too large", false)
            return
        }

        // Convert the file to a buffer.
        const buffer = await dp.arrayBuffer()

        // Emit the buffer to the server.
        socket.emit(EVENTS.SET_PROFILE_PICTURE, { file: buffer }, (response: { success: boolean, message: string, dp: string }) => {
            if (response.success) {
                dispatch(updateUser({ ...user, dp: response.dp }))
            } else {
                addToast("Something went wrong", false)
            }
        })
    }, [socket, user, dispatch, addToast])

    // Function to update bio.
    const updateBio = useCallback((bio: string) => {
        if (!socket || !user) return

        socket.emit(EVENTS.SET_BIO, { bio }, (response: { success: boolean, message: string, bio: string }) => {
            if (response.success) {
                dispatch(updateUser({ ...user, bio: response.bio }))
            } else {
                addToast("Something went wrong", false)
            }
        })
    }, [socket, user, dispatch, addToast])

    // Function to add connection.
    const addConnection = useCallback(({ userEmailToAdd, success, failure }: { userEmailToAdd: string, success: () => void, failure: () => void }) => {
        if (!socket) return failure()
        socket.emit(EVENTS.ADD_CONNECTION, { userEmailToAdd }, (response: { success: boolean, message: string, addedConnection?: IConnection }) => {
            if (response.success && response.addedConnection) {
                dispatch(updateConnections([...(user as IUser).connections, response.addedConnection]))
                success()
            } else {
                failure()
            }
        })
    }, [socket, user, dispatch])

    // Function to fetch the last messages.
    const fetchLastMessages = async () => {
        // Set loading state to true and get the token.
        setLoadingLastMessages(true)

        try {
            const messages = await requests.getLastMessages()
            setLastMessages(messages)
        } catch (err) {
            console.error("Error fetching last messages:", err)
            setError("Error fetching last messages")
            addToast("Something went wrong", false)
        } finally {
            setLoadingLastMessages(false)
        }
    }

    const handleUserActive = useCallback(({ userId }: { userId: string }) => {
        setActiveConnections([...activeConnections.current, userId])
    }, [setActiveConnections])

    const handleUserInactive = useCallback(({ userId }: { userId: string }) => {
        setActiveConnections(activeConnections.current.filter((id) => id !== userId))
        if (!user?.connections || user.connections.length <= 0) return
        const updatedUserConnections = [...user.connections]
        const userIndex = updatedUserConnections.findIndex(connection => connection.userId._id === userId)
        if (userIndex === -1) return
        const connection = updatedUserConnections[userIndex]
        updatedUserConnections[userIndex] = {
            ...connection,
            userId: {
                ...connection.userId,
                lastSeen: new Date().toISOString()
            }
        }
        dispatch(updateUser({ ...user, connections: [...updatedUserConnections] }))
    }, [setActiveConnections])

    const handleActiveConnections = useCallback(({ activeUserIds }: { activeUserIds: string }) => {
        setActiveConnections([...activeConnections.current, ...activeUserIds])
    }, [setActiveConnections])

    const handleConnectionUpdated = useCallback((newConnection: IConnection) => {
        if (user?.connections) {
            const updatedConnectionsArray = [...user?.connections, newConnection]
            dispatch(updateConnections(updatedConnectionsArray))
        }
    }, [user?.connections, dispatch])

    const handleReceiveMessage = useCallback((messageDetails: IChatMessage) => {
        const senderId = messageDetails.senderId
        if (senderId === receiverIdRef.current) {
            setChats(prevChats => prevChats ? [...prevChats, messageDetails] : [messageDetails])
        } else {
            const senderName = user?.connections.find(connection => connection.userId._id === senderId)?.userId.name.split(" ")[0]
            console.log(`New message ${senderName ? ("from " + senderName) : ""}`, true)
            addToast(`New message ${senderName ? ("from " + senderName) : ""}`, true)
        }

        const nChatId = user?._id as string < messageDetails.senderId ? `${user?._id}_${messageDetails.senderId}` : `${messageDetails.senderId}_${user?._id}`
        setLastMessages(prevLastMessages => {
            // Check if the chat ID already exists in the lastMessages array
            const existingIndex = prevLastMessages.findIndex(lastMessage => lastMessage.chatId === nChatId)

            if (existingIndex !== -1) {
                // Update the existing lastMessage for this chat
                return prevLastMessages.map((lastMessage, idx) =>
                    idx === existingIndex
                        ? { ...lastMessage, lastMessage: messageDetails }
                        : lastMessage
                )
            } else {
                // Add a new entry for this chat if it doesn't exist
                return [
                    ...prevLastMessages,
                    {
                        chatId: nChatId,
                        lastMessage: messageDetails,
                    }
                ]
            }
        })
    }, [user, receiverIdRef, setChats, setLastMessages, addToast])

    const handleSentMessage = useCallback(({ messageDetails, receiverId }: { messageDetails: IChatMessage, receiverId: string }) => {
        if (receiverIdRef.current === receiverId) {
            setChats(prevChats => prevChats ? [...prevChats, messageDetails] : [messageDetails])
        }

        const nChatId = user?._id as string < receiverId ? `${user?._id}_${receiverId}` : `${receiverId}_${user?._id}`
        setLastMessages(prevLastMessages => {
            // Check if the chat ID already exists in the lastMessages array
            const existingIndex = prevLastMessages.findIndex(lastMessage => lastMessage.chatId === nChatId)

            if (existingIndex !== -1) {
                // Update the existing lastMessage for this chat
                return prevLastMessages.map((lastMessage, idx) =>
                    idx === existingIndex
                        ? { ...lastMessage, lastMessage: messageDetails }
                        : lastMessage
                )
            } else {
                // Add a new entry for this chat if it doesn't exist
                return [
                    ...prevLastMessages,
                    {
                        chatId: nChatId,
                        lastMessage: messageDetails,
                    }
                ]
            }
        })
    }, [user, receiverIdRef, setChats, setLastMessages])

    const handleMessageRead = useCallback(({ messageIds }: { messageIds: string[] }) => {
        setChats(prevChats => prevChats?.map(chat => messageIds?.includes(chat._id) ? { ...chat, isRead: true, status: "sent" } : chat) || null)
    }, [setChats])

    const handleBioUpdated = useCallback(({ userId, bio }: { userId: string, bio: string }) => {
        const updatedUser = {
            ...user,
            connections: user?.connections.map(connection => {
                if (connection.userId._id === userId) {
                    return { ...connection, userId: { ...connection.userId, bio } }
                }
                return connection
            })
        }
        dispatch(updateUser(updatedUser))
    }, [user, dispatch])

    const handleConnectionAdded = useCallback(({ addedConnection }: { addedConnection: IConnection }) => {
        console.log("New connection added:", addedConnection)
        console.log("Current user:", user)
        dispatch(updateConnections([...(user as IUser).connections, addedConnection]))
    }, [user, dispatch])

    const handleProfilePictureUpdated = useCallback(({ userId, dp }: { userId: string, dp: string }) => {
        const updatedUser = {
            ...user,
            connections: user?.connections.map(connection => {
                if (connection.userId._id === userId) {
                    return { ...connection, userId: { ...connection.userId, dp } }
                }
                return connection
            })
        }

        dispatch(updateUser(updatedUser))
    }, [user, dispatch])

    const handleDeleteMessageForEveryone = useCallback(({ chatId: cId, messageIds }: { chatId: string, messageIds: string[] }) => {
        console.log("Received event EVENTS.DELETE_MESSAGE_FOR_EVERYONE/EVENTS.DELETE_MESSAGE_FOR_ME", cId, messageIds)
        if (chatId === cId) {
            setChats(prevChats => prevChats?.filter(chat => !messageIds.includes(chat._id)) || null)
        }

        setLastMessages(prevLastMessages => prevLastMessages.map(lastMessage => {
            if (lastMessage.chatId === cId) {
                return {
                    ...lastMessage,
                    lastMessage: {
                        ...lastMessage.lastMessage,
                        message: "The message has been deleted",
                        isRead: true
                    }
                }
            }
            return lastMessage
        }))
    }, [chatId, setChats, setLastMessages])

    useEffect(() => {
        // Only fetch last messages if user is authenticated
        if (user?._id) {
            fetchLastMessages()
        } else {
            setLoadingLastMessages(false)
        }
    }, [user?._id])

    useEffect(() => {
        // Only connect to socket if user is authenticated
        if (user?._id) {
            // Connect to the backend Socket.IO server.
            const newSocket = io("", {
                path: SOCKET_PATH,
                auth: {
                    token: localStorage.getItem("token")
                }
            })
            setSocket(newSocket)

            // Clean up the socket connection when the component unmounts.
            return () => {
                newSocket.disconnect()
            }
        } else {
            setSocket(null)
        }
    }, [user?._id])

    useEffect(() => {
        if (!socket) return
        socket.on(EVENTS.USER_ACTIVE, handleUserActive)
        socket.on(EVENTS.USER_INACTIVE, handleUserInactive)
        socket.on(EVENTS.ACTIVE_CONNECTIONS, handleActiveConnections)
        socket.on(EVENTS.ADD_CONNECTION, handleConnectionAdded)
        socket.on(EVENTS.CONNECTION_UPDATED, handleConnectionUpdated)
        socket.on(EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
        socket.on(EVENTS.SENT_MESSAGE, handleSentMessage)
        socket.on(EVENTS.MESSAGE_READ, handleMessageRead)
        socket.on(EVENTS.BIO_UPDATED, handleBioUpdated)
        socket.on(EVENTS.PROFILE_PICUTRE_UPDATED, handleProfilePictureUpdated)
        socket.on(EVENTS.DELETE_MESSAGE_FOR_ME, handleDeleteMessageForEveryone)
        socket.on(EVENTS.DELETE_MESSAGE_FOR_EVERYONE, handleDeleteMessageForEveryone)

        return () => {
            socket.off(EVENTS.USER_ACTIVE, handleUserActive)
            socket.off(EVENTS.USER_INACTIVE, handleUserInactive)
            socket.off(EVENTS.ACTIVE_CONNECTIONS, handleActiveConnections)
            socket.off(EVENTS.ADD_CONNECTION, handleConnectionAdded)
            socket.off(EVENTS.CONNECTION_UPDATED, handleConnectionUpdated)
            socket.off(EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
            socket.off(EVENTS.SENT_MESSAGE, handleSentMessage)
            socket.off(EVENTS.MESSAGE_READ, handleMessageRead)
            socket.off(EVENTS.BIO_UPDATED, handleBioUpdated)
            socket.off(EVENTS.PROFILE_PICUTRE_UPDATED, handleProfilePictureUpdated)
            socket.off(EVENTS.DELETE_MESSAGE_FOR_ME, handleDeleteMessageForEveryone)
            socket.off(EVENTS.DELETE_MESSAGE_FOR_EVERYONE, handleDeleteMessageForEveryone)
        }
    }, [socket])

    useEffect(() => {
        if (socket && chatId) {
            const messageIds = chats.filter(chat => chat.isRead === false && chat.senderId !== user?._id).map(chat => chat._id)
            if (messageIds && messageIds?.length > 0) {
                markAsRead(messageIds)
            }
        }
    }, [chats])

    return (
        <ChatContext.Provider value={{ socket, receiverId, updateReceiverId, lastMessages, chats, setChats, page, setPage, hasMore, setHasMore, loadingChats, setLoadingChats, sendMessage, markAsRead, addDp, addConnection, updateBio, onlineConnections, selectedMessages, addSelectedMessage, removeSelectedMessage, clearSelectedMessages, deleteMessage, forwardMessageWindowVisible, openForwardMessageWindow, closeForwardMessageWindow, forwardToReceiverIds, addForwardToReceiverId, removeForwardToReceiverId, forwardMessages, chatId, deleteWindowVisible, openDeleteWindow, closeDeleteWindow }}>
            {
                loadingLastMessages ? (
                    <div className="h-screen w-screen flex items-center justify-center">
                        <Loader />
                    </div>
                ) : error ? <p>Something went wrong</p> : children
            }
        </ChatContext.Provider>
    )
}

const useChatContext = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error("useChatContext must be used within a ChatContextProvider")
    }
    return context
}

export { ChatContextProvider, useChatContext }
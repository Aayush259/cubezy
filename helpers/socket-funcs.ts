import { Server as IOServer } from "socket.io"
import { CustomSocket, EVENTS } from "./socket-helpers"
import userService from "@/services/database/userService"
import chatService from "@/services/database/chatService"
import fileUploadService from "@/services/file-upload/fileUploadService"

const getSocketByUserId = (io: IOServer, id: string) => {
    return Array.from(io.sockets.sockets.values()).find(
        (s: CustomSocket) => s.data.user._id === id
    )
}

export const handleNewUserConnection = (
    { io, socket }: { io: IOServer, socket: CustomSocket }
) => {
    console.log("\n\n == HANDLE NEW USER CONNECTION ==")
    try {
        console.log("=> Notifying existing connections about newly connected user")
        // Notify connections about the connected user
        socket.data.user.connections.forEach(connection => {
            const receiverSocket = getSocketByUserId(io, connection.userId._id.toString())

            if (receiverSocket) {
                receiverSocket.emit(EVENTS.USER_ACTIVE, {
                    userId: socket.data.user._id
                })
            }
        })

        // Get all active connections
        const activeConnections = socket.data.user.connections.filter(
            connection => Array.from(io.sockets.sockets.values()).some(
                (s) => (s as CustomSocket).data.user._id.toString() === connection.userId._id.toString()
            )
        ).map(connection => connection.userId._id)

        console.log("=> Notifying newly connected user about existing connections")
        socket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: activeConnections })
    } catch (error) {
        console.log("Error handling new user connection:", error)
    }
}

export const handleUserDisconnection = (
    { io, socket }: { io: IOServer, socket: CustomSocket }
) => {
    console.log("\n\n == HANDLE USER DISCONNECTION ==", socket.data.user.name)

    console.log("=> Notifying existing connections about disconnected user")
    socket.data.user.connections.forEach(async (connection) => {
        const receiverSocket = getSocketByUserId(io, connection.userId._id.toString())

        if (receiverSocket) {
            (receiverSocket as CustomSocket).emit(EVENTS.USER_INACTIVE, {
                userId: socket.data.user._id
            })
        }
    })
}

export const setProfilePicture = async (
    { socket, io, file, callback }: { socket: CustomSocket, io: IOServer, file: Buffer, callback: Function }
) => {
    console.log("\n\n == SET PROFILE PICTURE ==")
    try {
        const uploadedFileUrl = await fileUploadService.upload({ file })
        console.log("=> Uploaded file URL:", uploadedFileUrl)

        if (uploadedFileUrl) {
            console.log("=> Setting profile picture for user:", socket.data.user.name)
            userService.setProfilePicture({
                id: socket.data.user._id,
                url: uploadedFileUrl
            })

            console.log("=> Notifying the user about the profile picture update")
            callback({
                success: true,
                message: "Profile picture set successfully",
                dp: uploadedFileUrl
            })

            console.log("=> Notifying existing connections about profile picture update")
            for (const connection of socket.data.user.connections) {
                // Get receiver socket
                const receiverSocket = getSocketByUserId(io, connection.userId._id.toString())

                if (receiverSocket) {
                    receiverSocket.emit(EVENTS.PROFILE_PICUTRE_UPDATED, {
                        userId: socket.data.user._id,
                        dp: uploadedFileUrl
                    })
                }
            }
        } else {
            throw new Error("Error uploading file, url is null")
        }
    } catch (error) {
        console.log("Error setting profile picture:", error)
        callback({
            success: false,
            message: "Error setting profile picture",
            error
        })
    }
}

export const setBio = async (
    { socket, io, bio, callback }: { socket: CustomSocket, io: IOServer, bio: string, callback: Function }
) => {
    console.log("\n\n == SET BIO ==", bio)
    if (!bio.trim()) {
        return callback({
            success: false,
            message: "Bio cannot be empty"
        })
    }

    try {
        console.log("=> Setting bio for user:", socket.data.user.name)
        const updatedUser = await userService.setBio({
            id: socket.data.user._id,
            bio
        })

        if (!updatedUser) {
            throw new Error("Error setting bio")
        }

        console.log("=> Notifying the user about the bio update")
        callback({
            success: true,
            message: "Bio set successfully",
            bio: updatedUser?.bio
        })

        console.log("=> Notifying existing connections about bio update")
        for (const connection of socket.data.user.connections) {
            const receiverSocket = getSocketByUserId(io, connection.userId._id.toString())

            if (receiverSocket) {
                receiverSocket.emit(EVENTS.BIO_UPDATED, {
                    userId: socket.data.user._id,
                    bio: updatedUser?.bio
                })
            }
        }
    } catch (error) {
        console.log("Error setting bio:", error)
        callback({
            success: false,
            message: "Error setting bio",
            error
        })
    }
}

export const sendMessage = async (
    { socket, io, receiverId, message, callback }: { socket: CustomSocket, io: IOServer, receiverId: string, message: string, callback: Function }
) => {
    console.log("\n\n == SEND MESSAGE ==", message, receiverId)
    try {
        const sender = socket.data.user
        const senderId = sender._id
        const { data: receiver } = await userService.getProfileById({ id: receiverId })

        if (!receiver) {
            throw new Error("Receiver not found")
        }

        const chatId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`

        const isSenderInReceiverConnection = receiver.profile.connections.some(connection => connection.userId._id.toString() === senderId)
        console.log("=> Is sender in receiver's connection:", isSenderInReceiverConnection)
        const receiverSocket = getSocketByUserId(io, receiverId)

        if (!isSenderInReceiverConnection) {
            console.log("=> Adding sender to receiver's connection")
            await userService.addConnection({
                id: receiver.profile._id.toString(),
                userEmailToAdd: sender.email,
            })

            if (receiverSocket) {
                console.log("=> Notifying receiver about new connection")
                receiverSocket.emit(EVENTS.CONNECTION_UPDATED, {
                    chatId,
                    userId: {
                        _id: socket.data.user._id.toString(),
                        name: socket.data.user.name,
                        bio: socket.data.user.bio,
                        email: socket.data.user.email,
                        dp: socket.data.user.dp
                    },
                });

                (receiverSocket as CustomSocket).data.user.connections.push({
                    chatId,
                    userId: {
                        _id: socket.data.user._id as any,
                        name: socket.data.user.name,
                        bio: socket.data.user.bio,
                        email: socket.data.user.email,
                        dp: socket.data.user.dp
                    }
                })

                socket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: [receiverId] })
                receiverSocket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: [senderId] })
            }
        }

        socket.data.user.connections.push({
            chatId,
            userId: {
                _id: receiver.profile._id,
                name: receiver.profile.name,
                bio: receiver.profile.bio,
                email: receiver.profile.email,
                dp: receiver.profile.dp
            }
        })

        // Save message to database
        const newMessage = await chatService.saveMessage({
            chatId,
            senderId,
            message
        })

        callback({
            success: true,
            _id: newMessage._id.toString(),
            sentAt: newMessage.sentAt
        })

        console.log("=> Message sent successfully")
        // Emitting message to receiver
        if (receiverSocket) {
            console.log("=> Notifying receiver about new message")
            receiverSocket.emit(EVENTS.RECEIVE_MESSAGE, {
                _id: newMessage._id.toString(),
                senderId,
                message,
                sentAt: newMessage.sentAt,
                isRead: false
            })
        }
    } catch (error) {
        console.log("Error sending message:", error)
        callback({
            success: false,
            message: "Error sending message",
            error
        })
    }
}

export const markMessageAsRead = async (
    { socket, io, chatId, messageIds, callback }: { socket: CustomSocket, io: IOServer, chatId: string, messageIds: string[], callback: Function }
) => {
    console.log("\n\n == MARK MESSAGE AS READ ==", chatId, messageIds)
    try {
        if (!chatId || !messageIds || messageIds.length === 0) {
            throw new Error("Invalid chatId or messageIds")
        }

        await chatService.markMessagesAsRead({
            chatId,
            messageIds,
            receiverId: socket.data.user._id
        })

        callback({
            success: true,
            message: "Message marked as read"
        })

        const [id1, id2] = chatId.split("_")
        const senderId = id1 === socket.data.user._id ? id2 : id1
        const senderSocket = getSocketByUserId(io, senderId)

        if (senderSocket) {
            // Emitting update to sender
            senderSocket.emit(EVENTS.MESSAGE_READ, {
                chatId,
                messageIds
            })
        }
    } catch (error) {
        console.log("Error marking message as read:", error)
        callback({
            success: false,
            message: "Error marking message as read",
            error
        })
    }
}

export const deleteMessagesForMe = async (
    { chatId, messageIds, callback }: { chatId: string, messageIds: string[], callback: Function }
) => {
    console.log("\n\n == DELETE MESSAGES FOR ME ==", chatId, messageIds)
    try {
        if (!chatId || !messageIds || messageIds.length === 0) {
            throw new Error("Invalid chatId or messageIds")
        }

        await chatService.deleteMessageForMe({
            chatId,
            messageIds,
        })

        callback({
            success: true,
            message: "Message deleted for me"
        })
    } catch (error) {
        console.log("Error deleting message for me:", error)
        callback({
            success: false,
            message: "Error deleting message for me",
            error
        })
    }
}

export const deleteMessagesForEveryone = async (
    { socket, io, chatId, messageIds, callback }: { socket: CustomSocket, io: IOServer, chatId: string, messageIds: string[], callback: Function }
) => {
    console.log("\n\n == DELETE MESSAGES FOR EVERYONE ==", chatId, messageIds)
    try {
        if (!chatId || !messageIds || messageIds.length === 0) {
            throw new Error("Invalid chatId or messageIds")
        }

        await chatService.deleteMessageFromEveryone({
            chatId,
            messageIds,
        })

        callback({
            success: true,
            message: "Message deleted for everyone"
        })

        const [id1, id2] = chatId.split("_")
        const receiverId = id1 === socket.data.user._id ? id2 : id1
        const receiverSocket = getSocketByUserId(io, receiverId)

        if (receiverSocket) {
            // Emitting update to receiver
            receiverSocket.emit(EVENTS.DELETE_MESSAGE_FOR_EVERYONE, {
                chatId,
                messageIds
            })
        }
    } catch (error) {
        console.log("Error deleting message for everyone:", error)
        callback({
            success: false,
            message: "Error deleting message for everyone",
            error
        })
    }
}
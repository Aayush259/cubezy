import { Server as IOServer } from "socket.io"
import { CustomSocket, EVENTS } from "./socket-helpers"
import userService from "@/services/database/userService"
import chatService from "@/services/database/chatService"
import fileUploadService from "@/services/file-upload/fileUploadService"

const getSocketByUserId = (io: IOServer, id: string) => {
    return Array.from(io.sockets.sockets.values()).filter(
        (s: CustomSocket) => s.data.user._id === id
    )
}

const getOtherSocketInstances = (io: IOServer, socket: CustomSocket) => {
    const senderId = socket.data.user._id
    return Array.from(io.sockets.sockets.values()).filter(
        (s: CustomSocket) => s.data.user._id === senderId && s.id !== socket.id
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
            const receiverSockets = getSocketByUserId(io, connection.userId._id.toString())

            receiverSockets.forEach((receiverSocket) => {
                console.log("Notifying", (receiverSocket as CustomSocket).data.user.name)
                receiverSocket.emit(EVENTS.USER_ACTIVE, {
                    userId: socket.data.user._id
                })
            })

            // if (receiverSocket) {
            //     receiverSocket.emit(EVENTS.USER_ACTIVE, {
            //         userId: socket.data.user._id
            //     })
            // }
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

export const handleUserDisconnection = async (
    { io, socket }: { io: IOServer, socket: CustomSocket }
) => {
    console.log("\n\n == HANDLE USER DISCONNECTION ==", socket.data.user.name)
    await userService.setLastSeen({ id: socket.data.user._id })

    console.log("=> Notifying existing connections about disconnected user")
    socket.data.user.connections.forEach(async (connection) => {
        const receiverSockets = getSocketByUserId(io, connection.userId._id.toString())

        receiverSockets.forEach((receiverSocket) => {
            receiverSocket.emit(EVENTS.USER_INACTIVE, {
                userId: socket.data.user._id
            })
        })

        // if (receiverSocket) {
        //     (receiverSocket as CustomSocket).emit(EVENTS.USER_INACTIVE, {
        //         userId: socket.data.user._id
        //     })
        // }
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
                const receiverSockets = getSocketByUserId(io, connection.userId._id.toString())

                receiverSockets.forEach((receiverSocket) => {
                    receiverSocket.emit(EVENTS.PROFILE_PICUTRE_UPDATED, {
                        userId: socket.data.user._id,
                        dp: uploadedFileUrl
                    })
                })

                // if (receiverSocket) {
                //     receiverSocket.emit(EVENTS.PROFILE_PICUTRE_UPDATED, {
                //         userId: socket.data.user._id,
                //         dp: uploadedFileUrl
                //     })
                // }
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
            const receiverSockets = getSocketByUserId(io, connection.userId._id.toString())

            receiverSockets.forEach((receiverSocket) => {
                receiverSocket.emit(EVENTS.BIO_UPDATED, {
                    userId: socket.data.user._id,
                    bio: updatedUser?.bio
                })
            })

            // if (receiverSocket) {
            //     receiverSocket.emit(EVENTS.BIO_UPDATED, {
            //         userId: socket.data.user._id,
            //         bio: updatedUser?.bio
            //     })
            // }
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
        const receiverSockets = getSocketByUserId(io, receiverId)

        if (!isSenderInReceiverConnection) {
            console.log("=> Adding sender to receiver's connection")
            await userService.addConnection({
                id: receiver.profile._id.toString(),
                userEmailToAdd: sender.email,
            })

            receiverSockets.forEach(receiverSocket => {
                console.log("=> Notifying receiver about new connection")
                receiverSocket.emit(EVENTS.CONNECTION_UPDATED, {
                    chatId,
                    userId: {
                        _id: socket.data.user._id.toString(),
                        name: socket.data.user.name,
                        bio: socket.data.user.bio,
                        email: socket.data.user.email,
                        dp: socket.data.user.dp,
                        lastSeen: socket.data.user?.lastSeen
                    }
                });

                (receiverSocket as CustomSocket).data.user.connections.push({
                    chatId,
                    userId: {
                        _id: socket.data.user._id as any,
                        name: socket.data.user.name,
                        bio: socket.data.user.bio,
                        email: socket.data.user.email,
                        dp: socket.data.user.dp,
                        lastSeen: socket.data.user?.lastSeen
                    }
                })

                receiverSocket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: [senderId] })
            })

            if (receiverSockets.length > 0) {
                socket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: [receiverId] })
            }

            // if (receiverSocket) {
            //     console.log("=> Notifying receiver about new connection")
            //     receiverSocket.emit(EVENTS.CONNECTION_UPDATED, {
            //         chatId,
            //         userId: {
            //             _id: socket.data.user._id.toString(),
            //             name: socket.data.user.name,
            //             bio: socket.data.user.bio,
            //             email: socket.data.user.email,
            //             dp: socket.data.user.dp,
            //             lastSeen: socket.data.user?.lastSeen
            //         },
            //     });

            //     (receiverSocket as CustomSocket).data.user.connections.push({
            //         chatId,
            //         userId: {
            //             _id: socket.data.user._id as any,
            //             name: socket.data.user.name,
            //             bio: socket.data.user.bio,
            //             email: socket.data.user.email,
            //             dp: socket.data.user.dp,
            //             lastSeen: socket.data.user?.lastSeen
            //         }
            //     })

            //     socket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: [receiverId] })
            //     receiverSocket.emit(EVENTS.ACTIVE_CONNECTIONS, { activeUserIds: [senderId] })
            // }
        }

        socket.data.user.connections.push({
            chatId,
            userId: {
                _id: receiver.profile._id,
                name: receiver.profile.name,
                bio: receiver.profile.bio,
                email: receiver.profile.email,
                dp: receiver.profile.dp,
                lastSeen: receiver.profile?.lastSeen
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

        // Notifying other instances of sender about the sent message
        const otherSenderSockets = getOtherSocketInstances(io, socket)
        otherSenderSockets.forEach(otherSenderSocket => {
            console.log("=> Notifying other sender instance about sent message")
            otherSenderSocket.emit(EVENTS.SENT_MESSAGE, {
                messageDetails: {
                    _id: newMessage._id.toString(),
                    senderId,
                    message,
                    sentAt: newMessage.sentAt,
                    isRead: false
                }, receiverId
            })
        })

        console.log("=> Message sent successfully")

        // Emitting message to receiver
        receiverSockets.forEach(receiverSocket => {
            console.log("=> Notifying receiver about new message")
            receiverSocket.emit(EVENTS.RECEIVE_MESSAGE, {
                _id: newMessage._id.toString(),
                senderId,
                message,
                sentAt: newMessage.sentAt,
                isRead: false
            })
        })

        // if (receiverSocket) {
        //     console.log("=> Notifying receiver about new message")
        //     receiverSocket.emit(EVENTS.RECEIVE_MESSAGE, {
        //         _id: newMessage._id.toString(),
        //         senderId,
        //         message,
        //         sentAt: newMessage.sentAt,
        //         isRead: false
        //     })
        // }
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
        const senderSockets = getSocketByUserId(io, senderId)

        senderSockets.forEach(senderSocket => {
            // Emitting update to sender
            senderSocket.emit(EVENTS.MESSAGE_READ, {
                chatId,
                messageIds
            })
        })

        // if (senderSocket) {
        //     // Emitting update to sender
        //     senderSocket.emit(EVENTS.MESSAGE_READ, {
        //         chatId,
        //         messageIds
        //     })
        // }
    } catch (error) {
        console.log("Error marking message as read:", error)
        callback({
            success: false,
            message: "Error marking message as read",
            error
        })
    }
}

export const addConnection = async (
    { socket, io, userEmailToAdd, callback }: { socket: CustomSocket, io: IOServer, userEmailToAdd: string, callback: Function }
) => {
    console.log("\n\n == ADD CONNECTION ==", userEmailToAdd)
    try {
        if (!userEmailToAdd.trim()) {
            return callback({
                success: false,
                message: "User email is required"
            })
        }

        const userId = socket.data.user._id
        const { data } = await userService.addConnection({ id: userId, userEmailToAdd })
        callback({
            success: true,
            message: "Connection added",
            addedConnection: data.addedConnection
        })

        const otherSocketInstances = getOtherSocketInstances(io, socket)
        otherSocketInstances.forEach(otherSocket => {
            // Emitting update to other instances of the user
            otherSocket.emit(EVENTS.ADD_CONNECTION, {
                addedConnection: data.addedConnection
            })
        })
    } catch (error) {
        console.log("Error adding connection:", error)
        callback({
            success: false,
            message: "Error adding connection",
            error
        })
    }
}

export const deleteMessagesForMe = async (
    { socket, io, chatId, messageIds, callback }: { socket: CustomSocket, io: IOServer, chatId: string, messageIds: string[], callback: Function }
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

        const otherSocketInstances = getOtherSocketInstances(io, socket)
        otherSocketInstances.forEach(otherSocket => {
            // Emitting update to other instances of the user
            otherSocket.emit(EVENTS.DELETE_MESSAGE_FOR_ME, {
                chatId,
                messageIds
            })
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

        const otherSocketInstances = getOtherSocketInstances(io, socket)
        otherSocketInstances.forEach(otherSocket => {
            // Emitting update to other instances of the user
            otherSocket.emit(EVENTS.DELETE_MESSAGE_FOR_EVERYONE, {
                chatId,
                messageIds
            })
        })

        const [id1, id2] = chatId.split("_")
        const receiverId = id1 === socket.data.user._id ? id2 : id1
        const receiverSockets = getSocketByUserId(io, receiverId)

        receiverSockets.forEach(receiverSocket => {
            // Emitting update to receiver
            receiverSocket.emit(EVENTS.DELETE_MESSAGE_FOR_EVERYONE, {
                chatId,
                messageIds
            })
        })

        // if (receiverSocket) {
        //     // Emitting update to receiver
        //     receiverSocket.emit(EVENTS.DELETE_MESSAGE_FOR_EVERYONE, {
        //         chatId,
        //         messageIds
        //     })
        // }
    } catch (error) {
        console.log("Error deleting message for everyone:", error)
        callback({
            success: false,
            message: "Error deleting message for everyone",
            error
        })
    }
}

// export const syncIndexedDb = async (
//     { socket, callback }: { socket: CustomSocket, callback: Function }
// ) => {
//     console.log("\n\n == SYNC INDEXED DB ==")
//     try {
        
//     } catch (error) {
//         console.log("Error syncing indexed db:", error)
//         callback({
//             success: false,
//             message: "Error syncing indexed db",
//             error
//         })
//     }
// }
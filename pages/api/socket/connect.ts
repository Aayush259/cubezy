import { NextApiRequest } from "next"
import { Server as IOServer } from "socket.io"
import userService from "@/services/database/userService"
import { CustomSocket, EVENTS, ExtendedNextApiResponse } from "@/helpers/socket-helpers"
import {
    deleteMessagesForEveryone,
    deleteMessagesForMe,
    handleNewUserConnection,
    handleUserDisconnection,
    markMessageAsRead,
    sendMessage,
    setBio,
    setProfilePicture,
    // syncIndexedDb
} from "@/helpers/socket-funcs"

let io: IOServer

export default async function handler(_: NextApiRequest, res: ExtendedNextApiResponse) {
    if (!res.socket.server.io) {
        // Creating new Socket.IO server.
        io = new IOServer(res.socket.server, {
            path: "/api/socket/connect"
        })

        // Middleware to handle authentication
        io.use(async (socket: CustomSocket, next) => {
            const token = socket.handshake.auth?.token

            if (!token) {
                return next(new Error("Unauthorized"))
            }

            try {
                const { data } = await userService.me({ token })
                socket.data.user = {
                    _id: data.user._id.toString(),
                    email: data.user.email,
                    name: data.user.name,
                    bio: data.user.bio,
                    dp: data.user.dp,
                    lastSeen: data.user?.lastSeen,
                    connections: data.user.connections.map(connection => ({
                        chatId: connection.chatId.toString(),
                        userId: connection.userId
                    }))
                }
                next()
            } catch (error) {
                return next(new Error("Unauthorized", { cause: error }))
            }
        })

        io.on("connection", (socket: CustomSocket) => {
            console.log("User connected:", socket.data.user.name)
            handleNewUserConnection({ io, socket })

            // socket.on(EVENTS.SYNC_INDEXED_DB, (callback) => syncIndexedDb({ socket, callback }))

            socket.on(
                EVENTS.SET_PROFILE_PICTURE,
                ({ file }: { file: Buffer }, callback) => setProfilePicture({ socket, io, file, callback })
            )

            socket.on(
                EVENTS.SET_BIO,
                ({ bio }: { bio: string }, callback) => setBio({ socket, io, bio, callback })
            )

            socket.on(
                EVENTS.SEND_MESSAGE,
                ({ receiverId, message }: { receiverId: string, message: string }, callback) => sendMessage({ socket, io, receiverId, message, callback })
            )

            socket.on(
                EVENTS.MARK_AS_READ,
                ({ chatId, messageIds }: { chatId: string, messageIds: string[] }, callback) => markMessageAsRead({ socket, io, chatId, messageIds, callback })
            )

            socket.on(
                EVENTS.DELETE_MESSAGE_FOR_ME,
                ({ chatId, messageIds }: { chatId: string, messageIds: string[] }, callback) => deleteMessagesForMe({ chatId, messageIds, callback })
            )

            socket.on(
                EVENTS.DELETE_MESSAGE_FOR_EVERYONE,
                ({ chatId, messageIds }: { chatId: string, messageIds: string[] }, callback) => deleteMessagesForEveryone({ socket, io, chatId, messageIds, callback })
            )

            socket.on("disconnect", () => {
                handleUserDisconnection({ socket, io })
            })
        })

        res.socket.server.io = io
    }

    res.end()
}
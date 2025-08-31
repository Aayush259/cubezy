import mongoose from "mongoose"
import { Socket as NetSocket } from "node:net"
import { Server as HTTPServer } from "node:http"
import { Server as IOServer, Socket } from "socket.io"

export interface CustomSocket extends Socket {
    data: {
        user: {
            _id: string
            email: string
            name: string
            bio: string
            dp: string | null
            lastSeen?: Date | null
            connections: {
                chatId: string
                userId: mongoose.Types.ObjectId | {
                    _id: mongoose.Types.ObjectId
                    email: string
                    name: string
                    bio: string
                    dp: string | null
                    lastSeen?: Date | null
                }
            }[]
        }
    }
}

export interface ExtendedNextApiResponse extends NetSocket {
    socket: {
        server: HTTPServer & {
            io: IOServer
        }
    }
}

export const EVENTS = {
    USER_ACTIVE: "user-active",
    USER_INACTIVE: "user-inactive",
    ACTIVE_CONNECTIONS: "active-connections",
    ADD_CONNECTION: "add-connection",
    SET_PROFILE_PICTURE: "set-profile-picture",
    PROFILE_PICUTRE_UPDATED: "profile-picture-updated",
    SET_BIO: "set-bio",
    BIO_UPDATED: "bio-updated",
    CONNECTION_UPDATED: "connection-updated",
    SEND_MESSAGE: "send-message",
    RECEIVE_MESSAGE: "receive-message",
    SENT_MESSAGE: "sent-message",
    MARK_AS_READ: "mark-as-read",
    MESSAGE_READ: "message-read",
    DELETE_MESSAGE_FOR_ME: "delete-message-for-me",
    DELETE_MESSAGE_FOR_EVERYONE: "delete-message-for-everyone",
    SYNC_INDEXED_DB: "sync-indexed-db"
}
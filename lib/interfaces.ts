export interface IConnection {
    chatId: string
    userId: {
        _id: string
        name: string
        email: string
        bio: string
        dp: string | null
        createdAt: Date
    }
}

export interface IUser {
    _id: string
    name: string
    email: string
    bio: string
    dp: string | null
    connections: IConnection[]
    createdAt: Date
    updatedAt: Date
}

export interface IProfile {
    _id: string
    name: string
    email: string
    bio: string
    dp: string | null
    connections?: IConnection[]
    createdAt: Date
}

export interface IUserSlice {
    isLoggedIn: boolean
    user: IUser | null
}

export interface IChatMessage {
    _id: string
    senderId: string
    message: string
    sentAt: Date
    isRead: boolean
    status?: "sending" | "sent"
}

export interface ILastMessage {
    chatId: string
    lastMessage: IChatMessage
}

export interface IToast {
    id: string
    message: string
    success: boolean
}

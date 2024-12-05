
export interface IUserSlice {
    isLoggedIn: boolean;
    user: {
        _id: string;
        name: string;
        email: string;
        connections: {
            _id: string;
            name: string;
            chatId: string;
        }[];
    } | null;
}

export interface IChatMessage {
    _id: string;
    senderId: string;
    message: string;
    sentAt: Date;
    isRead: boolean;
    status?: "sending" | "sent";
}

export interface ILastMessage {
    chatId: string;
    lastMessage: IChatMessage;
}

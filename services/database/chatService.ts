import db from "./dbService"
import { IUser } from "./userService"
import mongoose, { Document, Model } from "mongoose"

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId
    senderId: mongoose.Types.ObjectId
    message: string
    sentAt: Date
    isRead: boolean
    isSelfDeleted: boolean
    createdAt: Date
    updatedAt: Date
}

export class ChatService {
    private messageModelSchema

    constructor() {
        this.messageModelSchema = new mongoose.Schema({
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            message: { type: String, required: true },
            sentAt: { type: Date, default: Date.now },
            isRead: { type: Boolean, default: false },
            isSelfDeleted: { type: Boolean, default: false }
        })
    }

    private getMessageModel(chatId: string): Model<IMessage> {
        console.log("\n\nSERVICE: getMessageModel", chatId)
        const collectionName = `${chatId}`
        if (mongoose.models[collectionName]) {
            return mongoose.models[collectionName] as Model<IMessage>
        }
        return mongoose.model<IMessage>(collectionName, this.messageModelSchema)
    }

    async getLastMessage({ chatId }: { chatId: string }) {
        console.log("\n\nSERVICE: getLastMessage", chatId)
        const messageModel = this.getMessageModel(chatId)
        const lastMessage = await messageModel.findOne({ isSelfDeleted: false }).sort({ sentAt: -1 }).lean()
        console.log("SERVICE: getLastMessage => RESULT:", lastMessage)
        return lastMessage
    }

    async getLastMessages({ user }: { user: IUser }) {
        console.log("\n\nSERVICE: getLastMessages", user)
        const userConnectionsChatIds = user.connections.map(connection => connection.chatId)
        const lastMessages = await Promise.all(userConnectionsChatIds.map(async chatId => {
            const lastMessage = await this.getLastMessage({ chatId })
            return { chatId, lastMessage }
        }))
        console.log("SERVICE: getLastMessages => RESULT:", lastMessages)
        return lastMessages
    }

    async getMessagesCount({ chatId }: { chatId: string }) {
        console.log("\n\nSERVICE: getMessagesCount", chatId)
        const messageModel = this.getMessageModel(chatId)
        const count = await messageModel.countDocuments({ isSelfDeleted: false })
        console.log("SERVICE: getMessagesCount => RESULT:", count)
        return count
    }

    async getMessages({ chatId, limit, page }: { chatId: string, limit: number, page: number }) {
        console.log("\n\nSERVICE: getMessages", chatId, limit, page)
        const skip = (page - 1) * limit
        const messageModel = this.getMessageModel(chatId)
        const messages = await messageModel.find({ isSelfDeleted: false }).sort({ sentAt: -1 }).skip(skip).limit(limit).lean()
        const totalMessages = await this.getMessagesCount({ chatId })
        const hasMore = (messages.length + skip) < totalMessages
        console.log("SERVICE: getMessages => RESULT:", messages)
        return { chats: messages.slice(0, limit).reverse(), hasMore }
    }

    async getUnreadMessages({ chatId, senderId }: { chatId: string, senderId: string }) {
        console.log("\n\nSERVICE: getUnreadMessages", chatId, senderId)
        const messageModel = this.getMessageModel(chatId)
        const unreadMessages = await messageModel.find({ senderId, isRead: false }).lean()
        console.log("SERVICE: getUnreadMessages => RESULT:", unreadMessages)
        return unreadMessages
    }

    async saveMessage({ chatId, senderId, message }: { chatId: string, senderId: string, message: string }) {
        console.log("\n\nSERVICE: saveMessage", chatId, senderId, message)
        const messageModel = this.getMessageModel(chatId)
        const newMessage = await messageModel.create({ senderId, message })
        console.log("SERVICE: saveMessage => RESULT:", newMessage)
        return newMessage
    }

    async markMessagesAsRead({ chatId, messageIds, receiverId }: { chatId: string, messageIds: string[], receiverId: string }) {
        console.log("\n\nSERVICE: markMessagesAsRead", chatId, messageIds, receiverId)
        const messageModel = this.getMessageModel(chatId)
        await messageModel.updateMany(
            {
                _id: { $in: messageIds },   // Match messages by their IDs.
                senderId: { $ne: receiverId }  // Exclude messages sent by the receiver.
            },
            { isRead: true }
        )
    }

    async deleteMessageForMe({ chatId, messageIds }: { chatId: string, messageIds: string[] }) {
        console.log("\n\nSERVICE: deleteMessageForMe", chatId, messageIds)
        const messageModel = this.getMessageModel(chatId)
        return await messageModel.updateMany({ _id: { $in: messageIds }, isSelfDeleted: false }, { isSelfDeleted: true })
    }

    async deleteMessageFromEveryone({ chatId, messageIds }: { chatId: string, messageIds: string[] }) {
        console.log("\n\nSERVICE: deleteMessageFromEveryone", chatId, messageIds)
        const messageModel = this.getMessageModel(chatId)
        return await messageModel.deleteMany({
            _id: { $in: messageIds },
            isRead: { $ne: true },
            sentAt: { $gte: new Date(Date.now() - 5 * 60 * 60 * 1000), $lte: new Date() }
        })
    }
}

await db.connect()
const chatService = new ChatService()
export default chatService
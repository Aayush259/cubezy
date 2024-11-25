import mongoose, {Document, Model} from "mongoose";

interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    message: string;
    sentAt: Date;
}

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
});

const createMessageModel = (chatId: string): Model<IMessage> => {
    const collectionName = `chat_${chatId}`;
    if (mongoose.models[collectionName]) {
        return mongoose.models[collectionName] as Model<IMessage>;
    }
    return mongoose.model<IMessage>(collectionName, messageSchema);
};

export default createMessageModel;

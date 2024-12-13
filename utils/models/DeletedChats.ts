import mongoose, { Document, Model, Schema } from "mongoose";

interface IDeletedChats extends Document {
    chatId: string;
    userId: string;
    deletedMessages: string[];
};

const deletedMessagesSchema = new Schema<IDeletedChats>({
    chatId: {type: String, required: true},
    userId: {type: String, required: true},
    deletedMessages: {type: [String], default: []},
});

const DeletedChats: Model<IDeletedChats> = mongoose.models.DeletedChats || mongoose.model<IDeletedChats>("DeletedChats", deletedMessagesSchema);

export default DeletedChats;

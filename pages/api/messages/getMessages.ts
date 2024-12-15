import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectMongoDb from "@/utils/lib/mongodb";
import createMessageModel from "@/utils/models/Chat";
import DeletedChats from "@/utils/models/DeletedChats";
import mongoose from "mongoose";

export default async function getMessages(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // Extract token from the request headers.
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Verify jwt token.
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        if (!decodedToken?.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Connect to MongoDB.
        await connectMongoDb();

        // Extract chatId from the request body.
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: "Valid chatId is required" });
        }

        // Dynamically create or get chat model.
        const MessageModel = createMessageModel(chatId);

        // Fetch all messages from the collection.
        let messages = await MessageModel.find().sort({ sentAt: 1 });     // Sorting by sentAt for chronological order.

        // Check if the user has deleted any messages.
        const userDeletedChats = await DeletedChats.findOne({ chatId, userId: decodedToken.id });

        if (userDeletedChats) {
            // Extract deleted message IDs from the user's deleted chats.
            const deletedMessageIds = userDeletedChats.deletedMessages;

            // Filter out messages that have been deleted by the user.
            messages = messages.filter(message => !deletedMessageIds.includes((message._id as mongoose.Types.ObjectId).toString()));
        }

        res.status(200).json({
            message: "Messages fetched successfully",
            chats: messages,
        });
    } catch (error) {
        console.log("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    };
};

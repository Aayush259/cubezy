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
        const { chatId, page = 1, limit = 20 } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: "Valid chatId is required" });
        }

        const filteredMessages = [];
        const skip = (page - 1) * limit;
        let totalMessagesFetched = 0;

        // Dynamically create or get chat model.
        const MessageModel = createMessageModel(chatId);

        const userDeletedChats = await DeletedChats.findOne({ chatId, userId: decodedToken.id });

        const userDeletedChat = userDeletedChats?.deletedMessages;

        while (filteredMessages.length < limit) {

            let messages = await MessageModel.find()
            .sort({ sentAt: -1 })
            .skip(skip + totalMessagesFetched)
            .limit(limit - filteredMessages.length);

            if (messages.length === 0) break;

            messages = messages.filter(message => !userDeletedChat?.includes((message._id as mongoose.Types.ObjectId).toString()));

            filteredMessages.push(...messages);
            totalMessagesFetched += messages.length;

            if (totalMessagesFetched < limit) break;
        };

        const totalMessages = await MessageModel.countDocuments();
        const hasMore = (totalMessagesFetched + skip + (userDeletedChat?.length || 0)) < totalMessages;

        res.status(200).json({
            message: "Messages fetched successfully",
            chats: filteredMessages.slice(0, limit).reverse(),
            hasMore: hasMore,
        });
    } catch (error) {
        console.log("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    };
};

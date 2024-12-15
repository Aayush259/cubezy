import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectMongoDb from "@/utils/lib/mongodb";
import createMessageModel from "@/utils/models/Chat";
import User from "@/utils/models/User";
import DeletedChats from "@/utils/models/DeletedChats";
import mongoose from "mongoose";

export default async function getMessages(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
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

        // Fetch user from database
        const user = await User.findById(decodedToken.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = user.connections;
        const lastMessages = [];

        // Get the last message for each chat the user has.
        const userDeletedChats = await DeletedChats.findOne({ userId: decodedToken.id });

        for (const connection of connections) {
            const chatId = connection.chatId;
            const MessageModel = createMessageModel(chatId);

            // Fetch the last message from the chat which the user has not deleted.
            const query: any = {};

            if (userDeletedChats && userDeletedChats?.deletedMessages?.length > 0) {
                query._id = { $nin: userDeletedChats.deletedMessages.map((id: string) => new mongoose.Types.ObjectId(id)) };
            }

            const lastMessage = await MessageModel.findOne(query)
                .sort({ sentAt: -1 })
                .lean();

            if (lastMessage) {
                lastMessages.push({
                    chatId,
                    lastMessage
                });
            }
        }

        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        if (lastMessages.length === 0) {
            return res.status(200).json({
                message: "No messages found",
                lastMessages: []
            });
        }

        return res.status(200).json({
            message: "Messages fetched successfully",
            lastMessages
        });
    } catch (error) {
        console.log("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    };
};

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectMongoDb from "@/src/lib/mongodb";
import createMessageModel from "@/src/models/Chat";
import User from "@/src/models/User";

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

        for (const connection of connections) {
            const chatId = connection.chatId;
            const MessageModel = createMessageModel(chatId);

            // Fetch the last message from the chat
            const lastMessage = await MessageModel.findOne()
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

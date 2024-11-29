import connectMongoDb from "@/src/lib/mongodb";
import User from "@/src/models/User";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import createMessageModel from "@/src/models/Chat";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // Extract token from the request headers.
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        if (!decodedToken?.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Connect to MongoDB.
        await connectMongoDb();

        // Fetch the user from the database.
        const user = await User.findById(decodedToken.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const unreadMessages: Record<string, any[]> = {};   // Messages grouped by chatId.

        // Loop through all user's connections to find messages.
        for (const connection of user.connections) {
            const chatId = connection.chatId;

            const MessageModel = createMessageModel(chatId);

            // Fetch unread messages for this chat.
            const unread = await MessageModel.find({
                senderId: connection._id,
                isRead: false,
            }).lean();

            if (unread.length > 0) {
                unreadMessages[chatId] = unread;
            }
        }

        return res.status(200).json({
            message: "Unread messages fetched successfully",
            unreadMessages,
        });
    } catch (error) {
        console.log("Error fetching unread messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

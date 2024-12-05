import { NextApiRequest, NextApiResponse } from "next";
import connectMongoDb from "@/src/lib/mongodb";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default async function addConnection(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    };

    // Get token from header.
    const token = req.headers.authorization?.split(" ")[1];

    // Check if token exists, if not, return 401.
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Connect to MongoDB.
        await connectMongoDb();

        // Verify token.
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decodedToken.id);

        // Check if user exists.
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get id from body.
        const { idToAdd } = req.body;

        // Check if id is valid.
        if (!idToAdd) {
            return res.status(400).json({ message: "ID is required." });
        }

        // Get user to add.
        const userToAdd = await User.findById(idToAdd);

        // Check if user to add exists.
        if (!userToAdd) {
            return res.status(404).json({ message: `User with id ${idToAdd} not found` });
        }

        // Check if user is already connected.
        const isAlreadyConnected = user.connections.some(connection => connection._id.toString() === idToAdd);

        // If user is already connected, return 400.
        if (isAlreadyConnected) {
            return res.status(200).json({ message: "User is already in your connections.", connections: user.connections });
        }

        const chatId = user._id as string < idToAdd ? `${user._id}_${idToAdd}` : `${idToAdd}_${user._id}`;

        // Add user to connections.
        user.connections.push({
            chatId: chatId,
            _id: userToAdd._id as mongoose.Types.ObjectId,
            name: userToAdd.name,
        });

        // Save user.
        await user.save();

        res.status(200).json({ message: "User added to connections successfully", connections: user.connections });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

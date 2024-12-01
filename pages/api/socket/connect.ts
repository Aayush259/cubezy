import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { NextApiRequest } from "next";
import { Socket as NetSocket } from "net";
import jwt from "jsonwebtoken";
import connectMongoDb from "@/src/lib/mongodb";
import User from "@/src/models/User";
import createMessageModel from "@/src/models/Chat";
import mongoose from "mongoose";

interface CustomSocket extends Socket {
    data: {
        user: {
            _id: string;
            email: string;
            name: string;
            connections: {
                chatId: string;
                _id: string;
                name: string;
            }[];
        };
    };
}

let io: IOServer;

interface ExtendedNextApiResponse extends NetSocket {
    socket: {
        server: HTTPServer & {
            io?: IOServer;
        }
    }
}

export default async function handler(_: NextApiRequest, res: ExtendedNextApiResponse) {

    if (!res.socket.server.io) {
        console.log("Initializing Socket.io");

        // Creating new Socket.IO server.
        io = new IOServer(res.socket.server, {
            path: "/api/socket/connect",
        });

        // Middleware for jet authentication.
        io.use(async (socket, next) => {
            const token = socket.handshake.auth.token;
            console.log(token)

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            try {
                await connectMongoDb();
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
                const user = await User.findById(decodedToken.id);

                if (!user) {
                    console.log("User not found");
                    return next(new Error("User not found"));
                }

                // Attach user information to the socket.
                socket.data.user = {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    connections: user.connections,
                };

                next();
            } catch (error) {
                console.log("JWT authentication error", error);
                return next(new Error("JWT authentication error"));
            }
        });


        io.on("connection", (socket: CustomSocket) => {
            console.log(socket.data);
            console.log("User connected:", socket.data.user.name);

            socket.on("sendMessage", async ({ senderId, receiverId, message }: { senderId: string, receiverId: string, message: string }, callback) => {
                try {
                    await connectMongoDb();

                    // Fetching sender and receiver from the database.
                    const sender = await User.findById(senderId);
                    const receiver = await User.findById(receiverId);

                    // Checking if sender and receiver exist.
                    if (!sender || !receiver) {
                        console.log("Sender or receiver not found");
                        return socket.emit("error", { message: "Sender or receiver not found" });
                    }

                    // Generating a unique chat ID (sorted IDs ensure consistency).
                    const chatId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;

                    // Check if the sender is in the receiver's connections.
                    const isSenderInReceiverConnections = receiver.connections.some(connection => connection._id.toString() === senderId);

                    if (!isSenderInReceiverConnections) {
                        // Add sender to receiver's connections.
                        receiver.connections.push({
                            chatId: chatId,
                            _id: sender._id as mongoose.Types.ObjectId,
                            name: sender.name,
                        });

                        await receiver.save();

                        // Emit a real-time update to the receiver.
                        const receiverSocket = Array.from(io.sockets.sockets.values()).find((s) => (s as CustomSocket).data?.user._id === receiverId);

                        if (receiverSocket) {
                            (receiverSocket as CustomSocket).emit("connectionUpdated", {
                                chatId: chatId,
                                _id: sender._id,
                                name: sender.name,
                            });
                        }
                    }

                    // Creating or getting message model dynamically.
                    const MessageModel = createMessageModel(chatId);

                    // Saving the message to the database.
                    const newMessage = await MessageModel.create({
                        senderId,
                        message,
                    });

                    // Emit the new message ID and sent the timestamp to the sender.
                    callback({
                        _id: newMessage._id,
                        sentAt: newMessage.sentAt,
                    })

                    // Emit a real-time update to the sender.
                    socket.emit("messageSent", {
                        chatId: chatId,
                        _id: sender._id,
                        receiverId: receiver._id,
                    });

                    // Emitting message only to receiver.
                    const receiverSocket = Array.from(io.sockets.sockets.values()).find(
                        (s) => (s as CustomSocket).data?.user._id === receiverId
                    );

                    if (receiverSocket) {
                        (receiverSocket as CustomSocket).emit("receiveMessage", {
                            chatId,
                            senderId,
                            message,
                            sentAt: newMessage.sentAt,
                        });
                    }
                } catch (error) {
                    console.log("Error sending message:", error);
                }
            });

            socket.on("markAsRead", async ({ chatId, messageIds }: { chatId: string, messageIds: string[] }) => {

                try {
                    await connectMongoDb();
                    const MessageModel = createMessageModel(chatId);

                    // Update the message in the database.
                    await MessageModel.updateMany(
                        { _id: { $in: messageIds } },   // Match messages by their IDs.
                        { isRead: true }      // Set isRead to true.
                    );

                    // Notify sender about read status.
                    const senderSocket = Array.from(io.sockets.sockets.values()).find(
                        (s) => (s as CustomSocket).data?.user._id === socket.data.user._id
                    );

                    if (senderSocket) {
                        (senderSocket as CustomSocket).emit("messageRead", {
                            chatId,
                            messageIds,
                        });
                    }
                } catch (error) {
                    console.log("Error marking message as read:", error);
                }
            })

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            })
        })

        res.socket.server.io = io;
    }

    res.end();
}

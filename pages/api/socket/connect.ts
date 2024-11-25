import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { NextApiRequest } from "next";
import { Socket as NetSocket } from "net";
import jwt from "jsonwebtoken";
import connectMongoDb from "@/src/lib/mongodb";
import User from "@/src/models/User";
import createMessageModel from "@/src/models/Chat";

interface CustomSocket extends Socket {
    data: {
        user: {
            _id: string;
            email: string;
            name: string;
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

            socket.on("sendMessage", async ({ senderId, receiverId, message }: { senderId: string, receiverId: string, message: string }) => {
                try {
                    // Generating a unique chat ID (sorted IDs ensure consistency).
                    const chatId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;

                    // Creating or getting message model dynamically.
                    const MessageModel = createMessageModel(chatId);

                    // Saving the message to the database.
                    const newMessage = await MessageModel.create({
                        senderId,
                        message,
                    });

                    // Emitting message only to receiver.
                    const receiverSocket = Array.from(io.sockets.sockets.values()).find(
                        (s) => (s as CustomSocket).data?.user._id === receiverId
                    );

                    if (receiverSocket) {
                        (receiverSocket as CustomSocket).emit("receiveMessage", {
                            senderId,
                            message,
                            sentAt: newMessage.sentAt,
                        });
                    }
                } catch (error) {
                    console.log("Error sending message:", error);
                }
            });

            socket.on("message", (data) => {
                console.log("Message receiver jsehdw:", data);
                socket.broadcast.emit("message", data);
            })

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            })
        })

        res.socket.server.io = io;
    }

    res.end();
}

import { NextApiRequest, NextApiResponse } from "next";
import connectMongoDb from "@/utils/lib/mongodb";
import User from "@/utils/models/User";
import jwt from "jsonwebtoken";

export default async function getProfileInfo(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    };

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        await connectMongoDb();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decodedToken.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const id = req.query.id;

        if (!id) {
            return res.status(400).json({ message: "Invalid request" });
        }

        let profileInfo;

        if (id?.toString() === (user._id as string).toString()) {
            profileInfo = {
                _id: user._id,
                email: user.email,
                name: user.name,
                dp: user.dp,
                connections: user.connections,
                createdAt: user.createdAt,
            };
        } else {
            const profileUser = await User.findById(id);
            if (!profileUser) {
                return res.status(404).json({ message: "User not found" });
            }

            profileInfo = {
                _id: profileUser._id,
                email: "",
                name: profileUser.name,
                dp: profileUser.dp,
                connections: [],
                createdAt: profileUser.createdAt,
            };
        }


        res.status(200).json({
            _id: profileInfo._id,
            name: profileInfo.name,
            email: profileInfo.email,
            dp: profileInfo.dp,
            connections: profileInfo.connections,
            createdAt: profileInfo.createdAt,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


import { NextApiRequest, NextApiResponse } from "next";
import connectMongoDb from "@/src/lib/mongodb";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";

export default async function getUser(req: NextApiRequest, res: NextApiResponse) {
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

        const newJwt = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

        res.status(200).json({ token: newJwt, user: {
            _id: user._id,
            email: user.email,
            name: user.name,
        } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

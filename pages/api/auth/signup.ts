import { NextApiRequest, NextApiResponse } from "next";
import connectMongoDb from "@/utils/lib/mongodb";
import User from "@/utils/models/User";

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, password } = req.body;

    // Validate input.
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    };

    await connectMongoDb();

    // Check if user already exists.
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    };

    // Create new user.
    const user = new User({ name, email, password });
    await user.save();

    return res.status(201).json({ message: "User created successfully" });
};

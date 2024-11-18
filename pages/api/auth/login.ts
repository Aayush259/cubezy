import { NextApiRequest, NextApiResponse } from "next";
import connectMongoDb from "@/src/lib/mongodb";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    };


    const { email, password } = req.body;

    // Validate input.
    if (!email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    };

    await connectMongoDb();

    // Find user by email.
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    };

    // Compare passwords.
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    };

    // Generate JWT token.
    const token = jwt.sign(
        {id:  user._id, email: user.email},
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    // Send response token and user.
    return res.status(200).json({ token, user: {
        _id: user._id,
        email: user.email,
        name: user.name,
    } });
}

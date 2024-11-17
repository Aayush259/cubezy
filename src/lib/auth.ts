import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends NextApiRequest {
    user?: { id: string, email: string };
}

export const verifyToken = (handler: NextApiHandler) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];     // Bearer Token.

            if (!token) {
                return res.status(401).json({ message: "Token is required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, email: string };
            req.user = decoded;     // Attach user info to request object.
            return handler(req, res);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    }
}

import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    dp: string | null;
    connections: {chatId: string, _id: mongoose.Types.ObjectId; name: string, dp: string | null}[];
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
};

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    dp: {type: String, default: null},
    createdAt: {type: Date, default: Date.now},
    connections: [
        {
            chatId: String,
            _id: { type: mongoose.Types.ObjectId, ref: "User" },    // Receiver's Chat ID.
            name: { type: String, required: true },
            dp: { type: String, default: null },
        },
    ],
});

// Hash password before saving.
userSchema.pre<IUser>("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare hashed password.
userSchema.methods.comparePassword = async function(password: string) {
    return await bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

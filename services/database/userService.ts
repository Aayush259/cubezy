import bcrypt from "bcryptjs"
import mongoose, { Document, Model, Schema } from "mongoose"
import db from "./dbService"
import { JoseService } from "../jose/joseService"

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    password: string
    bio: string
    dp: string | null
    connections: { chatId: string, userId: mongoose.Types.ObjectId }[]
    comparePassword(password: string): Promise<boolean>
    createdAt: Date
    updatedAt: Date
}

export class UserService extends JoseService {
    private userModel

    constructor() {
        super()
        const userSchema = new Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            bio: { type: String, default: "I'm cool." },
            dp: { type: String, default: null },
            connections: [
                {
                    chatId: { type: String, required: true },
                    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },    // Receiver's User ID.
                },
            ],
        }, { timestamps: true })

        // Hash password before saving.
        userSchema.pre<IUser>("save", async function (next) {
            if (!this.isModified("password")) return next()
            const salt = await bcrypt.genSalt(10)
            this.password = await bcrypt.hash(this.password, salt)
            next()
        })

        // Compare hashed password.
        userSchema.methods.comparePassword = async function (password: string) {
            return await bcrypt.compare(password, this.password)
        }

        const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
        this.userModel = User
    }

    async signup({ name, email, password }: { name: string, email: string, password: string }) {
        console.log("\n\nSERVICE: signup", { name, email, password })
        const userExists = await this.userModel.findOne({ email })

        if (userExists) {
            console.log("SERVICE: signup => ERROR: Email already taken")
            throw Error("Email already taken")
        }

        // Create new user.
        const newUser = await this.userModel.create({ name, email, password })

        const accessToken = await this.signToken({
            id: newUser._id.toString(),
        })

        const refreshToken = await this.signToken({
            id: newUser._id.toString(),
        })

        console.log("SERVICE: signup => SUCCESS")
        return {
            success: true,
            message: "Signup successful",
            data: {
                accessToken,
                refreshToken,
                newUser: {
                    _id: newUser._id.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    bio: newUser.bio,
                    dp: newUser.dp,
                    connections: newUser.connections,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt,
                }
            }
        }
    }

    async login({ email, password }: { email: string, password: string }) {
        console.log("\n\nSERVICE: login", { email, password })
        const user = await this.userModel.findOne({ email }).populate([
            {
                path: "connections.userId",
                select: "name email bio dp createdAt"
            }
        ])
        if (!user) {
            console.log("SERVICE: login => ERROR: User not found")
            throw new Error("Invalid credentials")
        }

        const isMatch = await user.comparePassword(password)

        if (!isMatch) {
            throw new Error("Invalid password")
        }

        const accessToken = await this.signToken({
            id: user._id.toString(),
        })

        const refreshToken = await this.signToken({
            id: user._id.toString(),
        })

        console.log("SERVICE: login => SUCCESS")
        return {
            success: true,
            message: "Logged in sucessfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    dp: user.dp,
                    connections: user.connections,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            }
        }
    }

    async me({ token }: { token: string }) {
        console.log("\n\nSERVICE: me", { token })
        const decoded = await this.verifyToken(token)
        if (!decoded) {
            console.log("SERVICE: me => ERROR: Invalid token")
            throw Error("Invaid token")
        }

        const user = await this.userModel.findById(decoded.id).populate([
            {
                path: "connections.userId",
                select: "name email bio dp createdAt"
            }
        ])
        if (!user) {
            console.log("SERVICE: me => ERROR: User not found")
            throw Error("User not found")
        }

        const accessToken = await this.signToken({
            id: user._id.toString(),
        })

        const refreshToken = await this.signToken({
            id: user._id.toString(),
        })

        console.log("SERVICE: me => SUCCESS")
        return {
            success: true,
            message: "Logged in sucessfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    dp: user.dp,
                    connections: user.connections,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            }
        }

    }

    async getProfileByEmail({ email }: { email: string }) {
        console.log("\n\nSERVICE: getProfileByEmail", { email })
        const profile = await this.userModel.findOne({ email }).select(["-password", "-connections"])

        if (!profile) {
            console.log("SERVICE: getProfileByEmail => ERROR: User not found")
            throw Error("User not found")
        }

        console.log("SERVICE: getProfileByEmail =>", profile)
        return {
            success: true,
            data: { profile }
        }
    }

    async getProfileById({ id }: { id: string }) {
        console.log("\n\nSERVICE: getProfileById", { id })
        const profile = await this.userModel.findById(id).select(["-password"]).populate([
            {
                path: "connections.userId",
                select: "name email bio dp createdAt"
            }
        ])

        if (!profile) {
            console.log("SERVICE: getProfileById => ERROR: User not found")
            throw Error("User not found")
        }

        console.log("SERVICE: getProfileById =>", profile)
        return {
            success: true,
            data: { profile }
        }
    }

    async addConnection({ id, userEmailToAdd }: { id: string, userEmailToAdd: string }) {
        console.log("\n\nSERVICE: addConnection", { id, userEmailToAdd })
        const user = await this.userModel.findById(id).select(["-password"])
        if (!user) {
            console.log("SERVICE: addConnection => ERROR: User not found")
            throw Error("User not found")
        }

        const userToAdd = await this.userModel.findOne({ email: userEmailToAdd }).select(["-password"])
        if (!userToAdd) {
            console.log("SERVICE: addConnection => ERROR: User to add not found")
            throw Error("User to add not found")
        }

        const idToAdd = userToAdd._id.toString()

        const isAlreadyConnected = user.connections.some(connection => connection.userId.toString() === idToAdd)

        // If user is already connected, return 400.
        if (isAlreadyConnected) {
            console.log("SERVICE: addConnection => ERROR: User already connected")
            throw Error("User already connected")
        }

        const chatId = user._id.toString() < idToAdd ? `${user._id.toString()}_${idToAdd}` : `${idToAdd}_${user._id.toString()}`

        user.connections.push({
            chatId: chatId,
            userId: userToAdd._id,
        })

        await user.save()
        console.log("SERVICE: addConnection =>", user)
        return {
            success: true,
            message: "User added successfully",
            data: {
                addedConnection: {
                    chatId,
                    userId: {
                        _id: userToAdd._id.toString(),
                        name: userToAdd.name,
                        email: userToAdd.email,
                        bio: userToAdd.bio,
                        dp: userToAdd.dp,
                        createdAt: userToAdd.createdAt,
                        updatedAt: userToAdd.updatedAt,
                    }
                }
            }
        }
    }

    async setProfilePicture({ id, url }: { id: string, url: string }) {
        console.log("\n\nSERVICE: setProfilePicture", { id, url })
        return await this.userModel.findByIdAndUpdate(id, { dp: url }, { new: true })
    }

    async setBio({ id, bio }: { id: string, bio: string }) {
        console.log("\n\nSERVICE: setBio", { id, bio })
        return await this.userModel.findByIdAndUpdate(id, { bio }, { new: true })
    }
}

await db.connect()
const userService = new UserService()
export default userService
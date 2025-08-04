import mailService from "../mail/mailService"
import { otpMail } from "@/helpers/html-content"
import mongoose, { Document, Model } from "mongoose"

export interface IOTP extends Document {
    _id: mongoose.Types.ObjectId
    email: string
    otp: string
    expiresAt: Date
}

export default class OTPService {
    private otpModel
    // private blackListedEmails: Set<string> = new Set()

    constructor() {
        const otpSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            otp: { type: String, required: true },
            expiresAt: { type: Date, required: true }
        }, { timestamps: true })

        const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model("OTP", otpSchema)
        this.otpModel = OTP
    }

    async sendOTP(email: string) {
        console.log("\n\nSERVICE: sendOTP", { email })
        const otp = Math.floor(100000 + Math.random() * 900000).toFixed(0) // Generate a 6-digit OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        const newOtp = await this.otpModel.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        )
        mailService.sendMail({
            to: email,
            subject: "Your OTP Code",
            content: otpMail(otp)
        })
        return newOtp
    }

    async verifyOtp({ email, otp }: { email: string, otp: string }) {
        console.log("\n\nSERVICE: verifyOtp", { email, otp })
        const otpRecord = await this.otpModel.findOne({ email, otp })

        if (!otpRecord) {
            throw new Error("Invalid OTP")
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new Error("OTP has expired")
        }

        await this.otpModel.deleteOne({ _id: otpRecord._id })
        return true
    }
}
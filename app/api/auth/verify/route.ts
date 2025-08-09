import { NextResponse } from 'next/server'
import OTPService from '@/services/database/otpService'
import userService from '@/services/database/userService'

export async function POST(req: Request) {
    try {
        const { email, otp, password } = await req.json()
        const otpService = new OTPService()

        const verified = otpService.verifyOtp({ email, otp })

        if (!verified) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 })
        }

        await userService.verifyUser({ email })
        const loginData = await userService.login({ email, password })

        const response = NextResponse.json({
            token: loginData.data.accessToken,
            user: loginData.data.user
        }, { status: 200 })

        // Set cookie
        response.cookies.set({
            name: 'refreshToken',
            value: loginData.data.refreshToken as string,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        })
        return response
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
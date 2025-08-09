import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()
        const loginData = await userService.login({ email, password })

        if (loginData?.redirect) {
            return NextResponse.json({
                message: "OTP Sent",
                data: {
                    redirect: loginData.redirect,
                }
            }, { status: 200 })
        }

        // Create response
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
        console.error('Login error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
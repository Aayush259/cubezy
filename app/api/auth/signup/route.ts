import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json()
        const signupData = await userService.signup({ name, email, password })

        return NextResponse.json({
            message: "OTP Sent",
            data: {
                redirect: signupData.redirect,
            }
        }, { status: 200 })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
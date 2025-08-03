import env from '@/config/envConf'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 })

        // Set cookie
        response.cookies.set({
            name: 'token',
            value: "",
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        });
        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { message: "Logout failed" },
            { status: 500 }
        )
    }
}
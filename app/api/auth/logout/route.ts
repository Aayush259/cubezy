import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 })

        // Clear refresh cookie
        response.cookies.set({
            name: 'refreshToken',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0
        })
        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
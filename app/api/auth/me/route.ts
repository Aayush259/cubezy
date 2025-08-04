import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

export async function GET() {
    try {
        const headersList = await headers()
        const authHeader = headersList.get('authorization')
        const token = authHeader?.split(' ')[1] || headersList.get('cookie')?.split('token=')[1]?.split(';')[0]
        console.log("\n\n/api/auth/me --> Token: ", token)
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { data } = await userService.me({ token })

        // Create response
        const response = NextResponse.json({
            token: data.accessToken,
            user: data.user
        }, { status: 200 })

        // Set cookie
        response.cookies.set({
            name: 'token',
            value: data.refreshToken,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        })
        return response
    } catch (error) {
        console.error('Me error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
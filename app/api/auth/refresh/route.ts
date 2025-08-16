import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

export async function POST() {
    try {
        const headersList = await headers()
        const cookieHeader = headersList.get('cookie') || ''
        const refreshToken = cookieHeader.split('refreshToken=')[1]?.split(';')[0]

        if (!refreshToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { data } = await userService.refresh({ refreshToken })

        const response = NextResponse.json({
            data
        }, { status: 200 })

        // Optional: rotate refresh token if nearing expiry
        const decoded = await userService.verifyToken(refreshToken)
        if (decoded?.exp) {
            const msLeft = decoded.exp * 1000 - Date.now()
            const oneDayMs = 24 * 60 * 60 * 1000
            if (msLeft < oneDayMs) {
                // Issue a new refresh token
                const newRefreshToken = await userService.signRefreshToken({ id: decoded.id })
                response.cookies.set({
                    name: 'refreshToken',
                    value: newRefreshToken,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60
                })
            }
        }

        return response
    } catch (error) {
        console.error('Refresh error:', error)
        return NextResponse.json(
            { message: "Invalid refresh token" },
            { status: 500 }
        )
    }
}
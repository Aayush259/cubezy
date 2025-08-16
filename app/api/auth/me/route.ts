import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

export async function GET() {
    try {
        const headersList = await headers()
        const authHeader = headersList.get('authorization')
        const token = authHeader?.split(' ')[1] || headersList.get('cookie')?.split('refreshToken=')[1]?.split(';')[0]
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { data } = await userService.me({ token })

        // Create response
        return NextResponse.json({
            user: data.user
        }, { status: 200 })
    } catch (error) {
        console.error('Me error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
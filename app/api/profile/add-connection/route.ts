import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

export async function POST(req: Request) {
    try {
        const { userEmailToAdd } = await req.json()
        if (!userEmailToAdd) {
            return NextResponse.json(
                { message: "User email is required" },
                { status: 400 }
            )
        }

        const headersList = await headers()
        const user = JSON.parse(headersList.get('user') || '{}')
        const userId = user?.id.toString()
        const { data } = await userService.addConnection({ id: userId, userEmailToAdd })

        return NextResponse.json({
            message: "Connection added",
            addedConnection: data.addedConnection,
        }, { status: 200 })
    } catch (error) {
        console.error('Connection added error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
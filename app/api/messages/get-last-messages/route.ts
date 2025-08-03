import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import chatService from '@/services/database/chatService'
import userService from '@/services/database/userService'

export async function GET() {
    try {
        const headersList = await headers()
        const user = JSON.parse(headersList.get('user') || '{}')
        const userId = user?.id.toString()
        const { data } = await userService.getProfileById({ id: userId })
        const lastMessages = await chatService.getLastMessages({ user: data.profile })

        return NextResponse.json({
            message: "Last messages fetched",
            lastMessages
        }, { status: 200 })
    } catch (error) {
        console.error('Fetch last messages failed:', error)
        return NextResponse.json(
            { message: "Fetch last messages failed" },
            { status: 500 }
        )
    }
}
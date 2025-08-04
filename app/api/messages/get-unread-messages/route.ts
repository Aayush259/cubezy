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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unreadMessages: Record<string, any[]> = {}

        for (const connection of data.profile.connections) {
            const chatId = connection.chatId
            const unread = await chatService.getUnreadMessages({ chatId, senderId: connection.userId.toString() })

            if (unread.length > 0) {
                unreadMessages[chatId] = unread
            }
        }

        return NextResponse.json({
            message: "Fetched unread messages successfully",
            unreadMessages,
        }, { status: 200 })
    } catch (error) {
        console.error('Error fetching unread messages:', error)
        return NextResponse.json(
            { message: "Error fetching unread messages" },
            { status: 500 }
        )
    }
}
import { NextResponse } from 'next/server'
import chatService from '@/services/database/chatService'

export async function POST(req: Request) {
    try {
        const { chatId, page = 1, limit = 20 } = await req.json()

        if (!chatId) {
            return NextResponse.json(
                { message: "Chat ID is required" },
                { status: 400 }
            )
        }

        const messages = await chatService.getMessages({ chatId, limit, page })

        return NextResponse.json({
            message: "Messages fetched successfully",
            messages,
        }, { status: 200 })
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
            { message: "Error fetching messages" },
            { status: 500 }
        )
    }
}
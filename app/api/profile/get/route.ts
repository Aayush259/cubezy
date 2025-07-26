import userService from '@/services/database/userService'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { userId } = await req.json()
        if (!userId) {
            return NextResponse.json(
                { message: "UserId is required" },
                { status: 400 }
            )
        }

        const { data } = await userService.getProfileById({ id: userId })

        return NextResponse.json({
            message: "Connection added",
            profile: data.profile,
        }, { status: 200 })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { message: error },
            { status: 500 }
        )
    }
}
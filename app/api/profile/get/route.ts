import { NextResponse } from 'next/server'
import userService from '@/services/database/userService'

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
            message: "Profile fetched successfully",
            profile: data.profile,
        }, { status: 200 })
    } catch (error) {
        console.error('Failed to fetch profile:', error)
        return NextResponse.json(
            { message: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}
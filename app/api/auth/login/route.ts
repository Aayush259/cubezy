import db from '@/services/database/dbService';
import userService from '@/services/database/userService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const { data } = await userService.login({ email, password });

        // Create response
        const response = NextResponse.json({
            token: data.accessToken,
            user: data.user
        }, { status: 200 });

        // Set cookie
        response.cookies.set({
            name: 'token',
            value: data.refreshToken,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: error },
            { status: 500 }
        );
    }
}

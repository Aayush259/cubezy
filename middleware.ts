import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import joseService from './services/jose/joseService'
import { publicApiRoutes, publicRoutes } from './lib/data'

export async function middleware(request: NextRequest) {
    console.log('Middleware called')
    const pathname = request.nextUrl.pathname.replace(/\/+$/, '')

    // Check if the route is public
    const isPublicRoute = publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)

    // If it's a public route, allow access
    if (isPublicRoute) {
        console.log('Public route, allowing access', pathname)
        return NextResponse.next()
    }

    // Get token from header for API routes or from cookies for pages
    const token = request.nextUrl.pathname.startsWith('/api')
        ? request.headers.get('authorization')?.split(' ')[1]
        : request.cookies.get('token')?.value

    if (!token) {
        // For API routes, return JSON response
        if (request.nextUrl.pathname.startsWith('/api')) {
            console.log("==> Pathname:", request.nextUrl.pathname)
            console.log('Authentication required, no token found')
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            )
        }
        // For pages, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        const decoded = await joseService.verifyToken(token)
        if (!decoded) throw new Error('Invalid token')

        // Add user info to request headers
        const requestHeaders = new Headers(request.headers)
        console.log('Decoded token:', decoded)
        requestHeaders.set('user', JSON.stringify(decoded))

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (error) {
        console.log(error)
        // For API routes, return JSON response
        if (request.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            )
        }
        // For pages, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    // Match all routes except static files and api routes
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)']
}
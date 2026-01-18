import { type NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        if (
            req.nextUrl.pathname.startsWith('/indev') ||
            req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.startsWith('/favicon.ico')
        ) {
            return NextResponse.next()
        }

        return NextResponse.rewrite(new URL('/indev', req.url))
    }
}

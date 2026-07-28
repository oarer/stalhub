import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { LOCALE } from '@/types/item.type'

const intlMiddleware = createMiddleware({
	locales: LOCALE,
	defaultLocale: 'ru',
})

export function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl

	const requestHeaders = new Headers(req.headers)
	requestHeaders.set('X-Path', pathname)

	const intlResponse = intlMiddleware(req)

	if (intlResponse) {
		intlResponse.headers.forEach((value, key) => {
			requestHeaders.set(key, value)
		})
	}

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	})

	const hasRefreshToken = req.cookies.has('refresh_token')

	if (hasRefreshToken) {
		response.cookies.set('has_session', 'true', {
			path: '/',
			maxAge: 60 * 60 * 24,
			sameSite: 'lax',
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
		})
	} else {
		response.cookies.set('has_session', '', { path: '/', maxAge: 0 })
	}

	return response
}

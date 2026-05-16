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

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	})
}

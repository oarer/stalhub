import type { NextRequest } from 'next/server'
import { forwardMapAsset, mapBackendOrigin } from '../transport'

function fromSite(request: NextRequest): boolean {
	const source =
		request.headers.get('origin') ?? request.headers.get('referer')
	const fetchSite = request.headers.get('sec-fetch-site')
	if (fetchSite && fetchSite !== 'same-origin') return false
	if (!source) return fetchSite === 'same-origin'
	try {
		return new URL(source).origin === new URL(request.url).origin
	} catch {
		return false
	}
}

async function forward(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	if (!fromSite(request))
		return Response.json({ error: 'Not found' }, { status: 404 })
	return forwardMapAsset(
		request,
		(await params).path.join('/'),
		mapBackendOrigin()
	)
}
export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
export const HEAD = forward

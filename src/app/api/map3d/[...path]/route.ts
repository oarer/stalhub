import type { NextRequest } from 'next/server'
import { forwardMapAsset, mapBackendOrigin } from '../transport'

async function forward(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
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

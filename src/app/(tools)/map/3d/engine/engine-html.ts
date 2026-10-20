import { readFile } from 'node:fs/promises'
import path from 'node:path'

const HEADERS = {
	'Content-Type': 'text/html; charset=utf-8',
	'Content-Disposition': 'inline',
	'Cache-Control': 'no-store, max-age=0',
	'X-Content-Type-Options': 'nosniff',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'credentialless',
	'Cross-Origin-Resource-Policy': 'same-origin',
}

export async function engineHtml(name: string): Promise<Response> {
	try {
		const html = await readFile(
			path.join(process.cwd(), 'public/map3d-engine', name),
		)
		return new Response(new Uint8Array(html), { headers: HEADERS })
	} catch {
		return new Response('Engine build not found', {
			status: 503,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		})
	}
}

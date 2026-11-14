import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { NextRequest } from 'next/server'
import { buildContentOgSvg } from '@/lib/content-og'
import { buildApiService } from '@/services/build-api/build-api.service'

export const runtime = 'nodejs'

const FONT_FILE = join(
	process.cwd(),
	'public',
	'fonts',
	'mts',
	'MTSExtended-Medium.ttf'
)

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const build = await buildApiService.get(id)
		const svg = buildContentOgSvg({
			title: build.title,
			description: build.tags.join(' · '),
			author: build.author.username,
			stars: build.stars_count,
			comments: build.comments_count ?? 0,
			type: 'СБОРКА',
		})
		const png = new Resvg(svg, {
			fitTo: { mode: 'width', value: 1200 },
			font: {
				loadSystemFonts: false,
				fontFiles: [FONT_FILE],
				defaultFontFamily: 'MTS Extended',
			},
		})
			.render()
			.asPng()
		return new Response(Buffer.from(png), {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			},
		})
	} catch {
		return new Response('OG render failed', { status: 500 })
	}
}
